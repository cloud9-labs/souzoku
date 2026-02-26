import { calcDeadlineMilestones, formatJpDate, parseDateString } from '@/lib/utils/deadline'

interface Props {
  deathDate: string
}

export function DeadlineTimeline({ deathDate }: Props) {
  const milestones = calcDeadlineMilestones(parseDateString(deathDate))

  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className={`flex gap-4 p-4 rounded-xl border-l-4 ${m.isOverdue ? 'border-red-500 bg-red-50' : m.urgency === 'warning' ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-white'}`}>
          <div className="flex-shrink-0 text-center w-20">
            <div className={`text-2xl font-bold ${m.isOverdue ? 'text-red-600' : m.urgency === 'warning' ? 'text-orange-600' : 'text-gray-500'}`}>
              {m.isOverdue ? `+${Math.abs(m.remainingDays)}` : m.remainingDays}
            </div>
            <div className="text-xs text-gray-400">{m.isOverdue ? '日超過' : '日後'}</div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800 text-sm">{m.label}</h4>
              {m.isLegal && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">法定期限</span>
              )}
              {m.isOverdue && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">⚠️ 超過</span>
              )}
              {!m.isOverdue && m.urgency === 'warning' && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">要注意</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{formatJpDate(m.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
