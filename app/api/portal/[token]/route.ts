import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const supabase = createAdminClient()

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('id, deceased_name, filing_deadline, client_name, documents(id, document_name, category, tier, status, obtain_from, notes)')
    .eq('portal_token', token)
    .single()

  if (error || !caseData) {
    return NextResponse.json({ error: '無効なURLです' }, { status: 404 })
  }

  return NextResponse.json(caseData)
}
