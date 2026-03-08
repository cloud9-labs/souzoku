'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Upload, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'

interface PortalDocument {
  id: string
  document_name: string
  category: string
  tier: number
  status: string
  obtain_from: string
  notes: string
}

interface PortalCase {
  id: string
  deceased_name: string
  filing_deadline: string
  client_name: string
  documents: PortalDocument[]
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'received' || status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        <CheckCircle className="w-3 h-3" /> 提出済み
      </span>
    )
  }
  if (status === 'requested') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
        <Clock className="w-3 h-3" /> 依頼中
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <AlertCircle className="w-3 h-3" /> 未提出
    </span>
  )
}

function DocumentCard({
  doc,
  token,
  onUploaded,
}: {
  doc: PortalDocument
  token: string
  onUploaded: (docId: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isDone = doc.status === 'received' || doc.status === 'confirmed'

  const handleFile = async (file: File) => {
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    form.append('documentId', doc.id)

    const res = await fetch(`/api/portal/${token}/upload`, { method: 'POST', body: form })
    if (res.ok) {
      onUploaded(doc.id)
    } else {
      const data = await res.json()
      setError(data.error ?? 'アップロードに失敗しました')
    }
    setUploading(false)
  }

  return (
    <div className={`border rounded-lg p-4 ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-900 text-sm">{doc.document_name}</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{doc.category}</p>
          {doc.obtain_from && (
            <p className="text-xs text-gray-400">取得先: {doc.obtain_from}</p>
          )}
          {doc.notes && (
            <p className="text-xs text-gray-400 mt-1">{doc.notes}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <StatusBadge status={doc.status} />
          {!isDone && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-3 h-3" />
                {uploading ? 'アップロード中...' : 'ファイルを提出'}
              </button>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}

export default function PortalPage() {
  const { token } = useParams<{ token: string }>()
  const [caseData, setCaseData] = useState<PortalCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (data) { setCaseData(data); setLoading(false) }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  const handleUploaded = (docId: string) => {
    setCaseData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        documents: prev.documents.map(d =>
          d.id === docId ? { ...d, status: 'received' } : d
        ),
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (notFound || !caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">URLが無効です</p>
          <p className="text-gray-400 text-sm mt-1">担当者にお問い合わせください</p>
        </div>
      </div>
    )
  }

  const daysLeft = differenceInDays(new Date(caseData.filing_deadline), new Date())
  const deadlineFormatted = format(new Date(caseData.filing_deadline), 'yyyy年M月d日(E)', { locale: ja })
  const docs = caseData.documents ?? []
  const received = docs.filter(d => d.status === 'received' || d.status === 'confirmed').length
  const progress = docs.length > 0 ? Math.round((received / docs.length) * 100) : 0

  const tier1 = docs.filter(d => d.tier === 1)
  const tier2 = docs.filter(d => d.tier === 2)
  const tier3 = docs.filter(d => d.tier === 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-400 mb-1">相続書類管理システム</p>
          <h1 className="text-lg font-bold text-gray-900">
            {caseData.deceased_name} 様 の相続手続き
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {caseData.client_name} 様 向け書類提出ポータル
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 申告期限・進捗 */}
        <div className={`rounded-lg p-4 border ${
          daysLeft < 0 ? 'bg-red-50 border-red-200' :
          daysLeft <= 30 ? 'bg-red-50 border-red-200' :
          daysLeft <= 90 ? 'bg-orange-50 border-orange-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">相続税申告期限</p>
              <p className="font-bold text-gray-900">{deadlineFormatted}</p>
              <p className={`text-sm font-medium ${
                daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-red-600' : daysLeft <= 90 ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}日超過` : `残り ${daysLeft} 日`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{progress}%</p>
              <p className="text-xs text-gray-500">書類提出率</p>
              <p className="text-xs text-gray-400">{received} / {docs.length} 件</p>
            </div>
          </div>
          <div className="h-2 bg-white bg-opacity-60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-2">書類の提出方法</h2>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>下記の書類一覧を確認してください</li>
            <li>各書類の「ファイルを提出」ボタンをタップ</li>
            <li>PDF・写真（JPEG/PNG）を選択してアップロード</li>
            <li>「提出済み」になれば完了です</li>
          </ol>
          <p className="text-xs text-gray-400 mt-2">※ ファイルは10MB以下、PDF・JPEG・PNG・WebP形式</p>
        </div>

        {/* 書類一覧 */}
        {tier1.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">1</span>
              必須書類（{tier1.length}件）
            </h2>
            <div className="space-y-2">
              {tier1.map(doc => (
                <DocumentCard key={doc.id} doc={doc} token={token} onUploaded={handleUploaded} />
              ))}
            </div>
          </div>
        )}

        {tier2.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-bold">2</span>
              資産確認書類（{tier2.length}件）
            </h2>
            <div className="space-y-2">
              {tier2.map(doc => (
                <DocumentCard key={doc.id} doc={doc} token={token} onUploaded={handleUploaded} />
              ))}
            </div>
          </div>
        )}

        {tier3.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
              特例・その他書類（{tier3.length}件）
            </h2>
            <div className="space-y-2">
              {tier3.map(doc => (
                <DocumentCard key={doc.id} doc={doc} token={token} onUploaded={handleUploaded} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          ご不明な点は担当者までお問い合わせください
        </p>
      </div>
    </div>
  )
}
