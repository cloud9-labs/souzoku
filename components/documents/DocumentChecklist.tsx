'use client'

import { useState, useCallback } from 'react'
import { Document, DocumentStatus, DocumentTier } from '@/types/case'
import { calculateProgress } from '@/lib/document-engine/generate-checklist'
import { DocumentCard } from './DocumentCard'
import { ProgressBar } from './ProgressBar'

const TIER_LABELS: Record<DocumentTier, string> = {
  1: '📋 TIER1：必須書類（全案件共通）',
  2: '📁 TIER2：財産種類別書類',
  3: '⭐ TIER3：特例・控除関連書類',
}

interface Props {
  initialDocuments: Document[]
  caseId: string
  filingDeadline?: string
}

export function DocumentChecklist({ initialDocuments, caseId, filingDeadline }: Props) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all')

  const handleStatusChange = useCallback(async (docId: string, newStatus: DocumentStatus) => {
    // 楽観的UI更新
    setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status: newStatus } : d))

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('更新失敗')
    } catch {
      // ロールバック
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status: documents.find(doc => doc.id === docId)?.status ?? d.status } : d))
      alert('ステータスの更新に失敗しました')
    }
  }, [documents])

  const progress = calculateProgress(documents as (Document & { status: string })[])
  const tiers = [1, 2, 3] as DocumentTier[]

  const filteredDocs = (tier: DocumentTier) =>
    documents
      .filter((d) => d.tier === tier)
      .filter((d) => filterStatus === 'all' || d.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* 進捗バー */}
      <ProgressBar progress={progress} />

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'すべて' },
          { value: 'not_requested', label: '未依頼' },
          { value: 'requested', label: '依頼済' },
          { value: 'received', label: '受取済' },
          { value: 'confirmed', label: '確認済' },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilterStatus(value as DocumentStatus | 'all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus === value ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}>
            {label}
            {value !== 'all' && (
              <span className="ml-1">({documents.filter(d => d.status === value).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* TIER別リスト */}
      {tiers.map((tier) => {
        const docs = filteredDocs(tier)
        if (documents.filter(d => d.tier === tier).length === 0) return null
        return (
          <div key={tier}>
            <h3 className="font-bold text-gray-700 mb-3">{TIER_LABELS[tier]}</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">このカテゴリにフィルター条件に合う書類はありません</p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onStatusChange={handleStatusChange} filingDeadline={filingDeadline} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
