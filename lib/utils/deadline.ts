import { addMonths, addDays, differenceInDays, format, isValid, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function calcFilingDeadline(deathDate: Date): Date {
  return addMonths(deathDate, 10)
}

export interface DeadlineMilestone {
  label: string
  description: string
  date: Date
  remainingDays: number
  isOverdue: boolean
  urgency: 'normal' | 'warning' | 'critical'
  isLegal: boolean
}

export function calcDeadlineMilestones(deathDate: Date): DeadlineMilestone[] {
  const today = new Date()
  const milestones = [
    {
      label: '死亡届の提出',
      description: '死亡を知った日から7日以内に市区町村役場へ提出',
      date: addDays(deathDate, 7),
      isLegal: true,
    },
    {
      label: '相続の承認または放棄',
      description: '相続を知った日から3ヶ月以内。限定承認も同様。',
      date: addMonths(deathDate, 3),
      isLegal: true,
    },
    {
      label: '準確定申告',
      description: '被相続人の所得税・消費税申告。相続開始から4ヶ月以内。',
      date: addMonths(deathDate, 4),
      isLegal: true,
    },
    {
      label: '書類収集の完了目安',
      description: 'すべての書類を揃えて申告書作成に入る目安。',
      date: addMonths(deathDate, 7),
      isLegal: false,
    },
    {
      label: '遺産分割協議書の完成目安',
      description: '相続人全員の合意・署名・押印が必要。',
      date: addMonths(deathDate, 8),
      isLegal: false,
    },
    {
      label: '相続税申告・納税【期限】',
      description: '相続開始翌日から10ヶ月以内。遅延すると無申告加算税・延滞税が発生。',
      date: addMonths(deathDate, 10),
      isLegal: true,
    },
  ]

  return milestones.map((m) => {
    const remainingDays = differenceInDays(m.date, today)
    return {
      ...m,
      remainingDays,
      isOverdue: remainingDays < 0,
      urgency:
        remainingDays < 0 ? 'critical' : remainingDays < 30 ? 'warning' : 'normal',
    }
  })
}

export function calcNotificationSchedule(deathDate: Date) {
  return {
    day7: addDays(deathDate, 7),
    day30: addDays(deathDate, 30),
    day90: addDays(deathDate, 90),
    day240: addDays(deathDate, 240),
  }
}

export function formatJpDate(date: Date): string {
  if (!isValid(date)) return '---'
  return format(date, 'yyyy年M月d日（E）', { locale: ja })
}

export function formatShortDate(date: Date): string {
  if (!isValid(date)) return '---'
  return format(date, 'yyyy/MM/dd', { locale: ja })
}

export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr)
}
