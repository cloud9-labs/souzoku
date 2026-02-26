'use client'

import { Control, Controller, useWatch } from 'react-hook-form'
import { HearingFormData, SmallLandType } from '@/types/case'

interface Props {
  control: Control<HearingFormData>
}

const SMALL_LAND_OPTIONS: { value: SmallLandType; label: string; desc: string; reduction: string }[] = [
  { value: 'residential_spouse', label: '配偶者が居住用の宅地を取得', desc: '配偶者が自宅を引き継ぐ場合', reduction: '最大80%減額（330㎡まで）' },
  { value: 'residential_cohabitant', label: '同居親族が居住用の宅地を取得', desc: '一緒に住んでいた子等が引き継ぐ場合', reduction: '最大80%減額（330㎡まで）' },
  { value: 'residential_homeless_child', label: '別居親族（家なき子）が取得', desc: '相続開始前3年間、持ち家なしの別居親族', reduction: '最大80%減額（330㎡まで）' },
  { value: 'residential_nursing_home', label: '老人ホーム入居後の自宅', desc: '要介護・要支援認定を受けて施設入居中', reduction: '最大80%減額（330㎡まで）' },
  { value: 'business', label: '事業用宅地', desc: '被相続人の事業（個人事業）に使用していた土地', reduction: '最大80%減額（400㎡まで）' },
  { value: 'rental', label: '貸付事業用宅地', desc: '賃貸マンション・アパート等の敷地', reduction: '最大50%減額（200㎡まで）' },
]

export function Step4Exemptions({ control }: Props) {
  const smallLandTypes = useWatch({ control, name: 'small_land_types' }) ?? []

  const toggleSmallLand = (value: SmallLandType, currentValues: SmallLandType[], onChange: (v: SmallLandType[]) => void) => {
    if (currentValues.includes(value)) {
      onChange(currentValues.filter((v) => v !== value))
    } else {
      onChange([...currentValues, value])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 4：特例・特殊事情</h2>
        <p className="text-sm text-gray-500 mt-1">適用できる特例・控除を選択してください（複数選択可）</p>
      </div>

      {/* 小規模宅地等の特例 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          🏡 小規模宅地等の特例（不動産がある場合）
          <span className="text-xs text-gray-400 font-normal">※不動産評価額を大幅に減額できる最重要特例</span>
        </h3>
        <Controller name="small_land_types" control={control}
          render={({ field }) => (
            <div className="grid gap-2">
              {SMALL_LAND_OPTIONS.map((opt) => {
                const isSelected = (field.value as SmallLandType[])?.includes(opt.value)
                return (
                  <div key={opt.value}
                    onClick={() => toggleSmallLand(opt.value, field.value as SmallLandType[] ?? [], field.onChange)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">{opt.reduction}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        />
      </div>

      {/* その他の特例・控除 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">その他の特例・特殊事情</h3>
        {[
          { field: 'has_prior_gifts', label: '生前贈与あり（7年以内）', desc: '⚠️令和6年以降：持ち戻し期間が7年に延長', icon: '🎁' },
          { field: 'has_souzoku_kazeijoken', label: '相続時精算課税を選択していた', desc: '令和6年から年110万円の基礎控除が創設', icon: '📝' },
          { field: 'has_disabled_heir', label: '障害者の相続人がいる', desc: '（85歳−相続時年齢）×10〜20万円を控除', icon: '♿' },
          { field: 'has_minor_heir', label: '未成年の相続人がいる', desc: '（18歳−相続時年齢）×10万円を控除', icon: '👶' },
          { field: 'apply_spouse_deduction', label: '配偶者の税額軽減を適用', desc: '1億6,000万円または法定相続分まで非課税', icon: '💑' },
        ].map(({ field, label, desc, icon }) => (
          <Controller key={field} name={field as keyof HearingFormData} control={control}
            render={({ field: f }) => (
              <div onClick={() => f.onChange(!f.value)}
                className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer transition-all ${f.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${f.value ? 'text-purple-800' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${f.value ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  )
}
