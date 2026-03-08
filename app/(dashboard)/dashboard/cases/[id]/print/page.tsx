'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Case, Document } from '@/types/case'

interface CaseDetail extends Case {
  documents: Document[]
}

const TIER_LABELS: Record<number, string> = {
  1: 'TIER1：必須書類（全案件共通）',
  2: 'TIER2：財産種類別書類',
  3: 'TIER3：特例・控除関連書類',
}

export default function PrintPage() {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(r => r.json())
      .then(data => {
        setCaseData(data)
      })
  }, [id])

  if (!caseData) {
    return <div className="p-8 text-gray-400">読み込み中...</div>
  }

  const deadlineFormatted = format(new Date(caseData.filing_deadline), 'yyyy年M月d日(E)', { locale: ja })
  const tiers = [1, 2, 3] as const
  const docsByTier = tiers
    .map(tier => ({
      tier,
      docs: caseData.documents.filter(d => d.tier === tier),
    }))
    .filter(({ docs }) => docs.length > 0)

  return (
    <>
      {/* 印刷以外で表示するボタン */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          🖨️ 印刷する
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          閉じる
        </button>
      </div>

      {/* 印刷コンテンツ */}
      <div className="max-w-[210mm] mx-auto px-8 py-8 text-sm print:px-12 print:py-10">
        {/* ヘッダー */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">相続税申告　必要書類一覧</h1>
          <div className="mt-3 grid grid-cols-2 gap-x-8 text-sm text-gray-700">
            <div><span className="font-medium">被相続人：</span>{caseData.deceased_name} 様</div>
            <div><span className="font-medium">申告期限：</span><span className="font-bold text-red-700">{deadlineFormatted}</span></div>
            <div><span className="font-medium">ご依頼者：</span>{caseData.client_name} 様（{caseData.client_relationship}）</div>
            <div><span className="font-medium">作成日：</span>{format(new Date(), 'yyyy年M月d日', { locale: ja })}</div>
          </div>
        </div>

        {/* 書類一覧 */}
        {docsByTier.map(({ tier, docs }) => (
          <div key={tier} className="mb-8">
            <h2 className="font-bold text-gray-800 bg-gray-100 px-3 py-1.5 mb-3 text-sm">
              【{TIER_LABELS[tier]}】
            </h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left py-1.5 px-2 w-6 font-medium text-gray-600">No.</th>
                  <th className="text-left py-1.5 px-2 font-medium text-gray-600">書類名</th>
                  <th className="text-left py-1.5 px-2 w-36 font-medium text-gray-600">取得先</th>
                  <th className="text-left py-1.5 px-2 w-20 font-medium text-gray-600">費用目安</th>
                  <th className="text-left py-1.5 px-2 w-20 font-medium text-gray-600">取得期間</th>
                  <th className="text-left py-1.5 px-2 w-8 font-medium text-gray-600">確認</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr key={doc.id} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-500 align-top">{i + 1}</td>
                    <td className="py-2 px-2 align-top">
                      <div className="font-medium text-gray-800">{doc.document_name}</div>
                      {doc.notes && (
                        <div className="text-gray-500 mt-0.5 leading-relaxed">⚠️ {doc.notes}</div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-600 align-top leading-relaxed">{doc.obtain_from}</td>
                    <td className="py-2 px-2 text-gray-600 align-top">{doc.estimated_cost}</td>
                    <td className="py-2 px-2 text-gray-600 align-top">{doc.estimated_days}</td>
                    <td className="py-2 px-2 align-top">
                      <div className="w-5 h-5 border-2 border-gray-400 rounded-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* フッター */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>※ 本書類一覧は相続税申告に必要な書類の目安です。個別の状況により追加書類が必要となる場合があります。</p>
          <p className="mt-1">※ 書類の取得にあたってご不明な点は、担当税理士にご確認ください。</p>
          <p className="mt-1 font-medium text-gray-600">合計 {caseData.documents.length} 件の書類が必要です。</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 12mm;
          }
          body { font-size: 11px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  )
}
