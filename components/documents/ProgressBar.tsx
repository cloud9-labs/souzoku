interface TierProgress {
  tier: number
  total: number
  received: number
  confirmed: number
  rate: number
}

interface Props {
  progress: TierProgress[]
}

const TIER_CONFIG = {
  1: { label: '必須書類（全案件共通）', color: 'bg-red-500', light: 'bg-red-100' },
  2: { label: '財産種類別書類', color: 'bg-orange-500', light: 'bg-orange-100' },
  3: { label: '特例・控除関連書類', color: 'bg-purple-500', light: 'bg-purple-100' },
}

export function ProgressBar({ progress }: Props) {
  const totalDocs = progress.reduce((sum, p) => sum + p.total, 0)
  const totalReceived = progress.reduce((sum, p) => sum + p.received, 0)
  const overallRate = totalDocs === 0 ? 0 : Math.round((totalReceived / totalDocs) * 100)

  return (
    <div className="space-y-4">
      {/* 全体進捗 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">全体進捗</h3>
          <span className="text-2xl font-bold text-blue-600">{overallRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallRate}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {totalReceived} / {totalDocs} 点収集済み
          （残り {totalDocs - totalReceived} 点）
        </p>
      </div>

      {/* カテゴリ別 */}
      <div className="grid grid-cols-1 gap-3">
        {progress.filter(p => p.total > 0).map((p) => {
          const cfg = TIER_CONFIG[p.tier as keyof typeof TIER_CONFIG]
          return (
            <div key={p.tier} className="bg-white rounded-xl border p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-600">{p.rate}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${cfg.light}`}>
                <div
                  className={`${cfg.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${p.rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{p.received}/{p.total}点</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
