'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DeadlineTimeline } from '@/components/timeline/DeadlineTimeline'
import type { Case } from '@/types/case'

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(r => r.json())
      .then(data => {
        setCaseData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

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

  return (
    <div>
      <Link
        href={`/dashboard/cases/${id}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        {caseData.deceased_name} 様の案件に戻る
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">申告期限タイムライン</h1>
      <DeadlineTimeline deathDate={caseData.deceased_death_date} />
    </div>
  )
}
