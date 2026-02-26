'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Mail, Calendar, ChevronRight } from 'lucide-react'
import { DocumentChecklist } from '@/components/documents/DocumentChecklist'
import type { Case, Document } from '@/types/case'

interface CaseDetail extends Case {
  documents: Document[]
}

const NOTIFICATION_TYPES = [
  { type: 'day_7', label: '初回連絡（7日後）' },
  { type: 'day_30', label: '督促（30日後）' },
  { type: 'day_90', label: '強い督促（90日後）' },
  { type: 'day_240', label: '最終通告（240日後）' },
]

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingNotif, setSendingNotif] = useState<string | null>(null)
  const [notifSent, setNotifSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(r => r.json())
      .then(data => {
        setCaseData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSendNotification = async (notificationType: string) => {
    setSendingNotif(notificationType)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: id, notificationType }),
      })
      setNotifSent(prev => new Set([...prev, notificationType]))
    } finally {
      setSendingNotif(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">案件が見つかりません</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block">← 一覧に戻る</Link>
      </div>
    )
  }

  const daysLeft = differenceInDays(new Date(caseData.filing_deadline), new Date())
  const deadlineFormatted = format(new Date(caseData.filing_deadline), 'yyyy年M月d日(E)', { locale: ja })
  const deathDateFormatted = format(new Date(caseData.deceased_death_date), 'yyyy年M月d日', { locale: ja })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3 h-3" />
          案件一覧
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{caseData.deceased_name} 様（被相続人）</h1>
            <p className="text-sm text-gray-500 mt-1">
              依頼人: {caseData.client_name} 様　|　{caseData.client_email}　|　逝去日: {deathDateFormatted}
            </p>
          </div>
          <Link href={`/dashboard/cases/${id}/timeline`}>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              タイムライン
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 申告期限バナー */}
      <div className={`rounded-lg p-4 flex items-center gap-3 ${
        daysLeft < 0 ? 'bg-red-50 border border-red-200' :
        daysLeft <= 30 ? 'bg-red-50 border border-red-200' :
        daysLeft <= 90 ? 'bg-orange-50 border border-orange-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <Clock className={`w-5 h-5 ${
          daysLeft < 0 ? 'text-red-500' :
          daysLeft <= 30 ? 'text-red-500' :
          daysLeft <= 90 ? 'text-orange-500' :
          'text-blue-500'
        }`} />
        <div>
          <div className="font-semibold text-gray-900">
            申告期限: {deadlineFormatted}
          </div>
          <div className={`text-sm ${
            daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-red-600' : daysLeft <= 90 ? 'text-orange-600' : 'text-blue-600'
          }`}>
            {daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : `残り ${daysLeft} 日`}
          </div>
        </div>
      </div>

      {/* 書類チェックリスト（進捗バーを内包） */}
      <DocumentChecklist
        initialDocuments={caseData.documents}
        caseId={id}
      />

      {/* リマインダー送信 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4" />
            リマインダーメール送信
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {caseData.client_name} 様（{caseData.client_email}）へ書類提出の催促メールを送信します。
          </p>
          <div className="grid grid-cols-2 gap-2">
            {NOTIFICATION_TYPES.map(({ type, label }) => (
              <Button
                key={type}
                variant={notifSent.has(type) ? 'outline' : 'secondary'}
                size="sm"
                disabled={sendingNotif !== null || notifSent.has(type)}
                onClick={() => handleSendNotification(type)}
                className="text-xs"
              >
                {sendingNotif === type ? '送信中...' : notifSent.has(type) ? `✓ ${label}` : label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
