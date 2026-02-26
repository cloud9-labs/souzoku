'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { HearingFormData } from '@/types/case'
import { generateChecklist } from '@/lib/document-engine/generate-checklist'
import { Step1Deceased } from './Step1Deceased'
import { Step2Heirs } from './Step2Heirs'
import { Step3Assets } from './Step3Assets'
import { Step4Exemptions } from './Step4Exemptions'
import { Step5Current } from './Step5Current'
import { Button } from '@/components/ui/button'

const STEP_LABELS = ['被相続人情報', '相続人確定', '財産概況', '特例・控除', '依頼者情報']

const DEFAULT_VALUES: HearingFormData = {
  deceased_name: '',
  deceased_birth_date: '',
  deceased_death_date: '',
  deceased_address: '',
  has_spouse: false,
  children_count: 0,
  has_adopted_children: false,
  has_succession_renunciation: false,
  will_type: 'none',
  has_real_estate: false,
  has_deposits: true,
  has_listed_stocks: false,
  has_unlisted_stocks: false,
  has_life_insurance: false,
  has_retirement_allowance: false,
  has_farmland: false,
  has_overseas_assets: false,
  has_crypto: false,
  has_debt: false,
  small_land_types: [],
  apply_spouse_deduction: false,
  has_prior_gifts: false,
  has_souzoku_kazeijoken: false,
  has_disabled_heir: false,
  has_minor_heir: false,
  client_email: '',
  client_name: '',
}

export function HearingWizard() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { control, handleSubmit, trigger, formState: { errors } } = useForm<HearingFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  })

  const STEP_VALIDATE_FIELDS: Record<number, (keyof HearingFormData)[]> = {
    1: ['deceased_name', 'deceased_birth_date', 'deceased_death_date', 'deceased_address'],
    2: ['children_count'],
    3: [],
    4: [],
    5: ['client_name', 'client_email'],
  }

  const handleNext = async () => {
    const fields = STEP_VALIDATE_FIELDS[step]
    const valid = fields.length === 0 ? true : await trigger(fields)
    if (valid) setStep((s) => Math.min(s + 1, 5))
  }

  const onSubmit = async (data: HearingFormData) => {
    setIsSubmitting(true)
    try {
      const checklist = generateChecklist(data)

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: data, documents: checklist }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '案件の作成に失敗しました')
      }

      const { caseId } = await res.json()
      router.push(`/dashboard/cases/${caseId}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : '予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ステッパー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 text-center hidden sm:block ${i + 1 === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[500px]">
        {step === 1 && <Step1Deceased control={control} errors={errors as Record<string, { message?: string }>} />}
        {step === 2 && <Step2Heirs control={control} errors={errors as Record<string, { message?: string }>} />}
        {step === 3 && <Step3Assets control={control} />}
        {step === 4 && <Step4Exemptions control={control} />}
        {step === 5 && <Step5Current control={control} errors={errors as Record<string, { message?: string }>} />}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}>
          ← 前へ
        </Button>

        {step < 5 ? (
          <Button type="button" onClick={handleNext}>
            次へ →
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? '作成中...' : '✅ 書類チェックリストを生成する'}
          </Button>
        )}
      </div>
    </div>
  )
}
