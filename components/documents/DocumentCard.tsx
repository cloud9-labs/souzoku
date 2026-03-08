'use client'

import { useState } from 'react'
import { Document, DocumentStatus } from '@/types/case'
import { FileUploadArea } from './FileUploadArea'

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; next: DocumentStatus | null }> = {
  not_requested: { label: '未依頼', color: 'bg-gray-100 text-gray-600', next: 'requested' },
  requested:     { label: '依頼済', color: 'bg-yellow-100 text-yellow-700', next: 'received' },
  received:      { label: '受取済', color: 'bg-blue-100 text-blue-700', next: 'confirmed' },
  confirmed:     { label: '確認済', color: 'bg-green-100 text-green-700', next: null },
}

const TIER_BADGE: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-purple-100 text-purple-700',
}

interface Props {
  doc: Document
  onStatusChange: (id: string, status: DocumentStatus) => void
  filingDeadline?: string
}

export function DocumentCard({ doc, onStatusChange, filingDeadline }: Props) {
  const [showWhy, setShowWhy] = useState(false)
  const cfg = STATUS_CONFIG[doc.status]
  const nextStatus = cfg.next

  const deadlineDisplay = (() => {
    if (!filingDeadline) return null
    const d = new Date(filingDeadline)
    const daysLeft = Math.floor((d.getTime() - Date.now()) / 86400000)
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    const urgency = daysLeft < 30 ? 'text-red-600' : daysLeft < 90 ? 'text-orange-600' : 'text-blue-600'
    return { label, urgency }
  })()

  return (
    <div className={`border rounded-xl p-4 transition-all ${doc.status === 'confirmed' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        {/* チェックボックス風ボタン */}
        <button
          onClick={() => nextStatus && onStatusChange(doc.id, nextStatus)}
          disabled={!nextStatus}
          className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${doc.status === 'confirmed' ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-blue-400'}`}
        >
          {doc.status === 'confirmed' && <span className="text-white text-sm font-bold">✓</span>}
          {doc.status === 'received' && <span className="text-blue-500 text-sm">○</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className={`font-medium text-sm ${doc.status === 'confirmed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {doc.document_name}
            </h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_BADGE[doc.tier]}`}>
                TIER{doc.tier}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>📍 {doc.obtain_from}</span>
            <span>💰 {doc.estimated_cost}</span>
            <span>⏱️ {doc.estimated_days}</span>
            {deadlineDisplay && (
              <span className={`font-medium ${deadlineDisplay.urgency}`}>
                📅 申告期限：{deadlineDisplay.label}まで
              </span>
            )}
          </div>

          {doc.notes && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1">
              ⚠️ {doc.notes}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showWhy ? '▲ 閉じる' : '？ なぜこの書類が必要か'}
            </button>

            {nextStatus && (
              <button
                onClick={() => onStatusChange(doc.id, nextStatus)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                → {STATUS_CONFIG[nextStatus].label}に更新
              </button>
            )}
          </div>

          {showWhy && (
            <div className="mt-2 text-xs text-gray-600 bg-blue-50 rounded-md px-3 py-2 border border-blue-100">
              {doc.why_needed}
            </div>
          )}

          <FileUploadArea
            documentId={doc.id}
            onUploaded={() => {
              if (doc.status === 'not_requested') {
                onStatusChange(doc.id, 'received')
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
