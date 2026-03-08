import { HearingWizard } from '@/components/hearing/HearingWizard'

export const dynamic = 'force-dynamic'

export default function NewCasePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">新規案件 — ヒアリング</h1>
      <HearingWizard />
    </div>
  )
}
