import { Resend } from 'resend'
import { formatJpDate } from '@/lib/utils/deadline'
import { parseISO } from 'date-fns'

const FROM = `${process.env.RESEND_FROM_NAME ?? '相続書類管理'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

type NotificationType = 'day_7' | 'day_30' | 'day_90' | 'day_240'

interface SendReminderParams {
  caseId: string
  clientName: string
  clientEmail: string
  deceasedName: string
  filingDeadline: string
  notificationType: NotificationType
  pendingDocuments?: string[]
}

export async function sendReminder(params: SendReminderParams) {
  const { caseId, clientName, clientEmail, deceasedName, filingDeadline, notificationType, pendingDocuments = [] } = params
  const deadlineStr = formatJpDate(parseISO(filingDeadline))
  const portalUrl = `${APP_URL}/cases/${caseId}`

  const templates: Record<NotificationType, { subject: string; body: string }> = {
    day_7: {
      subject: `【相続書類管理】${deceasedName}様の相続手続きについて`,
      body: `
${clientName}様

このたびは${deceasedName}様のご逝去に際し、謹んでお悔やみ申し上げます。
書類のご案内という形でご連絡をいたしますことをどうかご了承ください。

相続税の申告期限は【${deadlineStr}】です。

まずは以下のポータルより、必要な書類の一覧をご確認いただき、
お手元にある書類からご準備をお始めください。

▼ 書類確認ポータル
${portalUrl}

ご不明な点はいつでもお気軽にお問い合わせください。
      `.trim(),
    },
    day_30: {
      subject: `【書類確認】${deceasedName}様の相続手続き 進捗確認`,
      body: `
${clientName}様

${deceasedName}様の相続手続きについて、進捗確認のご連絡です。

申告期限：【${deadlineStr}】

${pendingDocuments.length > 0 ? `■ 現在未提出の書類（${pendingDocuments.length}点）\n${pendingDocuments.map(d => `  □ ${d}`).join('\n')}\n` : ''}
書類の状況はポータルよりご確認・更新いただけます。

▼ 書類確認ポータル
${portalUrl}

ご準備が難しい書類がございましたら、お気軽にご相談ください。
      `.trim(),
    },
    day_90: {
      subject: `【進捗確認】申告期限まで残り7ヶ月 - ${deceasedName}様の相続手続き`,
      body: `
${clientName}様

${deceasedName}様の相続税申告期限まで、残り約7ヶ月となりました。

申告期限：【${deadlineStr}】

${pendingDocuments.length > 0 ? `■ 未提出の書類（${pendingDocuments.length}点）\n${pendingDocuments.map(d => `  □ ${d}`).join('\n')}\n\n` : ''}書類が揃い次第、申告書の作成に着手できます。
特に時間のかかる書類（金融機関の残高証明書・非上場株式の決算書等）は
お早めにご依頼をお願いいたします。

▼ 書類確認ポータル
${portalUrl}
      `.trim(),
    },
    day_240: {
      subject: `【重要・期限30日前】相続税申告の期限が迫っています - ${deceasedName}様`,
      body: `
${clientName}様

【重要なお知らせ】

${deceasedName}様の相続税申告期限まで、残り約30日となりました。

申告期限：【${deadlineStr}】

${pendingDocuments.length > 0 ? `■ 現在未提出の書類（${pendingDocuments.length}点）\n━━━━━━━━━━━━━━━━━━━\n${pendingDocuments.map(d => `□ ${d}`).join('\n')}\n━━━━━━━━━━━━━━━━━━━\n\n上記の書類が期限までに揃わない場合、申告期限に間に合わない可能性があります。\nお急ぎでご準備をお願いいたします。\n\n` : ''}ご事情がございましたら、今すぐお問い合わせください。

▼ 書類確認ポータル
${portalUrl}

※ 申告期限を過ぎると無申告加算税（15%）・延滞税が発生します。
      `.trim(),
    },
  }

  const template = templates[notificationType]

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY未設定のためメール送信をスキップします')
    return null
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: template.subject,
    text: template.body,
  })

  if (error) throw new Error(`メール送信エラー: ${error.message}`)
  return data
}
