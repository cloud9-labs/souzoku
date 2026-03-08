import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateChecklist } from '@/lib/document-engine/generate-checklist'
import { saveDevCase } from '@/lib/dev-store'
import { encrypt, encryptJson } from '@/lib/crypto'
import { randomBytes } from 'crypto'
import type { HearingFormData } from '@/types/case'
import type { DocumentDefinition } from '@/lib/document-engine/document-master'

const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === 'true'
const DEV_USER_ID = 'dev-user-00000000-0000-0000-0000-000000000000'

export async function GET() {
  try {
    if (DEV_BYPASS) {
      // 開発用：Supabase未設定時は空配列を返す
      return NextResponse.json([], { status: 200 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 200 })

    const { data, error } = await supabase
      .from('cases')
      .select('*, documents(status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const formData: HearingFormData = body.caseData
  const checklist: DocumentDefinition[] = body.documents ?? generateChecklist(formData)

  // 開発用バイパス：Supabase未設定時はダミーIDで成功レスポンスを返す
  if (DEV_BYPASS) {
    const deathDate = formData.deceased_death_date ? new Date(formData.deceased_death_date) : new Date()
    const deadline = new Date(deathDate)
    deadline.setMonth(deadline.getMonth() + 10)
    saveDevCase('dev-case-preview', formData, deadline.toISOString().split('T')[0])
    return NextResponse.json({ caseId: 'dev-case-preview' }, { status: 201 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  // cases テーブルへ挿入
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .insert({
      user_id: user.id,
      deceased_name: formData.deceased_name,
      deceased_birth_date: formData.deceased_birth_date,
      deceased_death_date: formData.deceased_death_date,
      deceased_address: formData.deceased_address,
      has_spouse: formData.has_spouse,
      children_count: formData.children_count,
      has_adopted_children: formData.has_adopted_children,
      has_succession_renunciation: formData.has_succession_renunciation,
      will_type: formData.will_type,
      has_real_estate: formData.has_real_estate,
      has_deposits: formData.has_deposits,
      has_listed_stocks: formData.has_listed_stocks,
      has_unlisted_stocks: formData.has_unlisted_stocks,
      has_life_insurance: formData.has_life_insurance,
      has_retirement_allowance: formData.has_retirement_allowance,
      has_farmland: formData.has_farmland,
      has_overseas_assets: formData.has_overseas_assets,
      has_crypto: formData.has_crypto,
      has_debt: formData.has_debt,
      small_land_types: formData.small_land_types,
      apply_spouse_deduction: formData.apply_spouse_deduction,
      has_prior_gifts: formData.has_prior_gifts,
      has_souzoku_kazeijoken: formData.has_souzoku_kazeijoken,
      has_disabled_heir: formData.has_disabled_heir,
      has_minor_heir: formData.has_minor_heir,
      client_name: formData.client_name,
      client_email: encrypt(formData.client_email ?? ''),
      client_relationship: formData.client_relationship,
      client_phone: encrypt(formData.client_phone ?? ''),
      client_address: encrypt(formData.client_address ?? ''),
      heirs: encryptJson(formData.heirs),
    })
    .select()
    .single()

  if (caseError) return NextResponse.json({ error: caseError.message }, { status: 500 })

  // portal_token を付与（列が存在しない場合は無視）
  await supabase
    .from('cases')
    .update({ portal_token: randomBytes(18).toString('base64url') })
    .eq('id', caseData.id)
    .then(() => {})  // エラーは無視

  // documents テーブルへ一括挿入
  const documentsToInsert = checklist.map((doc) => ({
    case_id: caseData.id,
    tier: doc.tier,
    category: doc.category,
    document_name: doc.document_name,
    obtain_from: doc.obtain_from,
    estimated_cost: doc.estimated_cost,
    estimated_days: doc.estimated_days,
    notes: doc.notes,
    why_needed: doc.why_needed,
    status: 'not_requested',
  }))

  const { error: docsError } = await supabase.from('documents').insert(documentsToInsert)
  if (docsError) return NextResponse.json({ error: docsError.message }, { status: 500 })

  return NextResponse.json({ caseId: caseData.id }, { status: 201 })
}
