import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateChecklist } from '@/lib/document-engine/generate-checklist'
import { getDevCase } from '@/lib/dev-store'
import { decrypt, decryptJson } from '@/lib/crypto'

const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === 'true'

const DEV_CASE = {
  id: 'dev-case-preview',
  user_id: 'dev-user',
  deceased_name: '山田 太郎（プレビュー）',
  deceased_birth_date: '1940-01-01',
  deceased_death_date: '2024-03-01',
  deceased_address: '東京都渋谷区〇〇町1-2-3',
  filing_deadline: '2025-01-01',
  has_spouse: true,
  children_count: 2,
  has_adopted_children: false,
  has_succession_renunciation: false,
  will_type: 'none',
  has_real_estate: true,
  has_deposits: true,
  has_listed_stocks: false,
  has_unlisted_stocks: false,
  has_life_insurance: true,
  has_retirement_allowance: false,
  has_farmland: false,
  has_overseas_assets: false,
  has_crypto: false,
  has_debt: false,
  small_land_types: [],
  apply_spouse_deduction: true,
  has_prior_gifts: false,
  has_souzoku_kazeijoken: false,
  has_disabled_heir: false,
  has_minor_heir: false,
  client_name: '山田 花子',
  client_email: 'hanako@example.com',
  client_relationship: '配偶者',
  client_phone: '090-1234-5678',
  client_address: '東京都渋谷区〇〇町1-2-3',
  heirs: [
    { name: '山田 花子', relationship: '配偶者' },
    { name: '山田 一郎', relationship: '長男' },
    { name: '山田 二郎', relationship: '次男' },
  ],
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  documents: [],
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (DEV_BYPASS) {
    const stored = getDevCase(id)
    const baseData = stored ? { ...DEV_CASE, ...stored.formData, filing_deadline: stored.filing_deadline } : DEV_CASE
    const checklist = generateChecklist(baseData as Parameters<typeof generateChecklist>[0])
    const documents = checklist.map((doc, i) => ({
      case_id: id,
      ...doc,
      id: `dev-doc-${i}`,
      status: 'not_requested' as const,
      assignee: null,
      due_date: null,
      received_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    return NextResponse.json({ ...baseData, documents })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { data, error } = await supabase
    .from('cases')
    .select('*, documents(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // 暗号化フィールドを復号
  const decrypted = {
    ...data,
    client_email: decrypt(data.client_email ?? ''),
    client_phone: decrypt(data.client_phone ?? ''),
    client_address: decrypt(data.client_address ?? ''),
    heirs: typeof data.heirs === 'string' ? decryptJson(data.heirs, data.heirs) : data.heirs,
  }
  return NextResponse.json(decrypted)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('cases')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
