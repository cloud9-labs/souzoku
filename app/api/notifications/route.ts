import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendReminder } from '@/lib/notifications/send-reminder'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { caseId, notificationType } = await req.json()

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*, documents(document_name, status)')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .single()

  if (error || !caseData) return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 })

  const pendingDocuments = (caseData.documents ?? [])
    .filter((d: { status: string; document_name: string }) => d.status === 'not_requested' || d.status === 'requested')
    .map((d: { document_name: string }) => d.document_name)

  await sendReminder({
    caseId,
    clientName: caseData.client_name,
    clientEmail: caseData.client_email,
    deceasedName: caseData.deceased_name,
    filingDeadline: caseData.filing_deadline,
    notificationType,
    pendingDocuments,
  })

  await supabase.from('notifications').upsert({
    case_id: caseId,
    notification_type: notificationType,
    recipient_email: caseData.client_email,
  }, { onConflict: 'case_id,notification_type' })

  return NextResponse.json({ ok: true })
}
