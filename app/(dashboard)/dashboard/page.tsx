'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { differenceInDays, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import type { Case } from '@/types/case'

interface CaseWithProgress extends Case {
  documents: Array<{ status: string }>
}

function getUrgencyInfo(filingDeadline: string) {
  const today = new Date()
  const deadline = new Date(filingDeadline)
  const daysLeft = differenceInDays(deadline, today)

  if (daysLeft < 0) return { label: '期限超過', color: 'bg-red-100 text-red-800', sort: 0 }
  if (daysLeft <= 30) return { label: `残${daysLeft}日`, color: 'bg-red-100 text-red-700', sort: 1 }
  if (daysLeft <= 90) return { label: `残${daysLeft}日`, color: 'bg-orange-100 text-orange-700', sort: 2 }
  return { label: `残${daysLeft}日`, color: 'bg-green-100 text-green-700', sort: 3 }
}

function calcProgress(documents: Array<{ status: string }>) {
  if (!documents.length) return 0
  const received = documents.filter(d => d.status === 'received' || d.status === 'confirmed').length
  return Math.round((received / documents.length) * 100)
}

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => {
        setCases(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">案件一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cases.length}件の案件</p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            新規案件
          </Button>
        </Link>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">案件がまだありません</p>
            <Link href="/dashboard/cases/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                最初の案件を作成する
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cases
            .sort((a, b) => {
              const ua = getUrgencyInfo(a.filing_deadline).sort
              const ub = getUrgencyInfo(b.filing_deadline).sort
              if (ua !== ub) return ua - ub
              return new Date(a.filing_deadline).getTime() - new Date(b.filing_deadline).getTime()
            })
            .map(c => {
              const urgency = getUrgencyInfo(c.filing_deadline)
              const progress = calcProgress(c.documents ?? [])
              const deadlineFormatted = format(new Date(c.filing_deadline), 'yyyy年M月d日(E)', { locale: ja })

              return (
                <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 truncate">
                              {c.deceased_name} 様（被相続人）
                            </span>
                            <Badge className={`text-xs shrink-0 ${urgency.color} border-0`}>
                              {urgency.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            依頼人: {c.client_name} 様　|　申告期限: {deadlineFormatted}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold text-gray-900">{progress}%</div>
                          <div className="text-xs text-gray-400">書類収集率</div>
                          <div className="mt-1 w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}
