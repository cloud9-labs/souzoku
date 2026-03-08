'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Mail, Calendar, ChevronRight, Phone, MapPin, Users, Link2, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
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
  const [copied, setCopied] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

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

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const daysLeft = differenceInDays(new Date(caseData.filing_deadline), new Date())
  const deadlineFormatted = format(new Date(caseData.filing_deadline), 'yyyy年M月d日(E)', { locale: ja })
  const deathDateFormatted = format(new Date(caseData.deceased_death_date), 'yyyy年M月d日', { locale: ja })

  return (
    <>
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
              依頼人: {caseData.client_name} 様{caseData.client_relationship ? `（${caseData.client_relationship}）` : ''}　|　逝去日: {deathDateFormatted}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {caseData.portal_token && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/portal/${caseData.portal_token}`
                  navigator.clipboard.writeText(url)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                <Link2 className="w-4 h-4 mr-1" />
                {copied ? 'コピーしました！' : '書類提出URLをコピー'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/dashboard/cases/${id}/print`, '_blank')}
            >
              🖨️ 書類一覧を印刷
            </Button>
            <Link href={`/dashboard/cases/${id}/timeline`}>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                タイムライン
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => { setShowDeleteModal(true); setDeleteInput('') }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              案件を削除
            </Button>
          </div>
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

      {/* 依頼者情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            依頼者情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium w-20">氏名</span>
              <span>{caseData.client_name} 様</span>
            </div>
            {caseData.client_relationship && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium w-20">続柄</span>
                <span>{caseData.client_relationship}</span>
              </div>
            )}
            {caseData.client_phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{caseData.client_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-3 h-3 shrink-0" />
              <span>{caseData.client_email}</span>
            </div>
            {caseData.client_address && (
              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{caseData.client_address}</span>
              </div>
            )}
          </div>

          {caseData.heirs && caseData.heirs.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="font-medium text-gray-700 mb-2">相続人一覧</p>
              <div className="flex flex-wrap gap-2">
                {caseData.heirs.map((heir, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                    {heir.name || '（氏名未入力）'}
                    {heir.relationship && <span className="text-gray-400">・{heir.relationship}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 書類チェックリスト（進捗バーを内包） */}
      <DocumentChecklist
        initialDocuments={caseData.documents}
        caseId={id}
        filingDeadline={caseData.filing_deadline}
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

    {/* 削除確認モーダル */}

    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">案件を削除しますか？</h2>
              <p className="text-sm text-red-600">この操作は取り消せません</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            削除される内容：書類チェックリスト・アップロードファイル・通知履歴すべて
          </p>
          <p className="text-sm text-gray-700 font-medium mt-4 mb-2">
            確認のため <span className="font-bold text-red-600">「{caseData.deceased_name}」</span> と入力してください
          </p>
          <Input
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            placeholder={caseData.deceased_name}
            className="mb-4"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteInput !== caseData.deceased_name || deleting}
              onClick={handleDelete}
            >
              {deleting ? '削除中...' : '削除する'}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
