'use client'

import { Control, Controller } from 'react-hook-form'
import { HearingFormData } from '@/types/case'

interface Props {
  control: Control<HearingFormData>
}

const ASSETS = [
  { field: 'has_real_estate', label: '不動産', desc: '土地・建物（自宅・賃貸・山林等）', icon: '🏠' },
  { field: 'has_deposits', label: '預貯金・現金', desc: '銀行・信用金庫・ゆうちょ・ネット銀行等', icon: '🏦' },
  { field: 'has_listed_stocks', label: '上場株式・投資信託', desc: '証券口座で管理されている有価証券', icon: '📈' },
  { field: 'has_unlisted_stocks', label: '非上場会社の株式・出資', desc: '同族会社・オーナー企業等（事業承継）', icon: '🏢' },
  { field: 'has_life_insurance', label: '生命保険金', desc: '死亡保険金・入院給付金等', icon: '🛡️' },
  { field: 'has_retirement_allowance', label: '死亡退職金', desc: '勤務先から支払われた退職金', icon: '💼' },
  { field: 'has_farmland', label: '農地・山林', desc: '田・畑・採草放牧地等', icon: '🌾' },
  { field: 'has_overseas_assets', label: '海外資産', desc: '外貨預金・海外不動産・海外口座等', icon: '🌏' },
  { field: 'has_crypto', label: '暗号資産（仮想通貨）', desc: 'ビットコイン・イーサリアム等、電子マネー', icon: '₿' },
  { field: 'has_debt', label: '借入金・葬式費用（控除）', desc: 'ローン・未払医療費・葬儀費用（マイナス資産）', icon: '📋' },
] as const

export function Step3Assets({ control }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 3：財産の概況</h2>
        <p className="text-sm text-gray-500 mt-1">
          該当する財産をONにしてください。ONにした財産の必要書類が自動的に追加されます。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {ASSETS.map(({ field, label, desc, icon }) => (
          <Controller key={field} name={field as keyof HearingFormData} control={control}
            render={({ field: f }) => (
              <div
                onClick={() => f.onChange(!f.value)}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all select-none ${f.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${f.value ? 'text-blue-800' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${f.value ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  )
}
