'use client'

import { Control, Controller, useWatch } from 'react-hook-form'
import { HearingFormData, WillType } from '@/types/case'
import { calculateHeirInfo } from '@/lib/document-engine/generate-checklist'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  control: Control<HearingFormData>
  errors: Record<string, { message?: string }>
}

const WILL_OPTIONS: { value: WillType; label: string; desc: string }[] = [
  { value: 'notarized', label: '公正証書遺言', desc: '公証役場で作成・保管。検認不要。' },
  { value: 'holographic_registry', label: '自筆証書遺言（法務局保管）', desc: '令和2年7月〜。検認不要。' },
  { value: 'holographic_self', label: '自筆証書遺言（自宅保管）', desc: '家庭裁判所での検認が必要。' },
  { value: 'none', label: '遺言書なし', desc: '遺産分割協議書の作成が必要。' },
]

export function Step2Heirs({ control, errors }: Props) {
  const hasSpouse = useWatch({ control, name: 'has_spouse' })
  const childrenCount = useWatch({ control, name: 'children_count' }) ?? 0
  const heirInfo = calculateHeirInfo({ has_spouse: hasSpouse ?? false, children_count: Number(childrenCount) })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 2：相続人の確定</h2>
        <p className="text-sm text-gray-500 mt-1">相続人の構成を入力してください</p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-green-600">法定相続人数</p>
            <p className="text-2xl font-bold text-green-800">{heirInfo.legal_heirs_count} 人</p>
          </div>
          <div>
            <p className="text-xs text-green-600">基礎控除額</p>
            <p className="text-2xl font-bold text-green-800">{heirInfo.basic_deduction.toLocaleString()} 万円</p>
          </div>
          <div>
            <p className="text-xs text-green-600">生命保険非課税枠</p>
            <p className="text-2xl font-bold text-green-800">{heirInfo.life_insurance_exempt.toLocaleString()} 万円</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* 配偶者 */}
        <Controller
          name="has_spouse"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">配偶者（ご夫婦）はいますか？</p>
                <p className="text-xs text-gray-500">配偶者控除（最大1億6千万円）の適用可否に関わります</p>
              </div>
              <div className="flex gap-3">
                {[{ v: true, l: 'あり' }, { v: false, l: 'なし' }].map(({ v, l }) => (
                  <button key={l} type="button" onClick={() => field.onChange(v)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${field.value === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        {/* お子様の人数 */}
        <div className="p-4 border rounded-lg">
          <Label htmlFor="children_count">お子様の人数（養子・認知のお子様を含む）</Label>
          <Controller
            name="children_count"
            control={control}
            rules={{ min: { value: 0, message: '0以上を入力してください' } }}
            render={({ field }) => (
              <div className="flex items-center gap-4 mt-2">
                <button type="button" onClick={() => field.onChange(Math.max(0, Number(field.value) - 1))}
                  className="w-10 h-10 rounded-full border text-xl font-bold text-gray-600 hover:bg-gray-100">−</button>
                <span className="text-3xl font-bold w-12 text-center">{field.value ?? 0}</span>
                <button type="button" onClick={() => field.onChange(Number(field.value) + 1)}
                  className="w-10 h-10 rounded-full border text-xl font-bold text-gray-600 hover:bg-gray-100">＋</button>
                <span className="text-gray-500">人</span>
              </div>
            )}
          />
        </div>

        {/* 相続放棄 */}
        <Controller name="has_succession_renunciation" control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">相続放棄をされる方はいますか？</p>
                <p className="text-xs text-gray-500">放棄しても法定相続人数は変わりません</p>
              </div>
              <div className="flex gap-3">
                {[{ v: true, l: 'あり' }, { v: false, l: 'なし' }].map(({ v, l }) => (
                  <button key={l} type="button" onClick={() => field.onChange(v)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${field.value === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        {/* 遺言書 */}
        <div className="p-4 border rounded-lg space-y-2">
          <p className="font-medium">遺言書はありますか？</p>
          <Controller name="will_type" control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {WILL_OPTIONS.map((opt) => (
                  <label key={opt.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === opt.value ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'}`}>
                    <input type="radio" className="mt-1" checked={field.value === opt.value} onChange={() => field.onChange(opt.value)} />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
