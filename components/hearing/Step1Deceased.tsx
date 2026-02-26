'use client'

import { useEffect } from 'react'
import { Control, Controller, useWatch } from 'react-hook-form'
import { addMonths, differenceInDays, parseISO, isValid } from 'date-fns'
import { formatJpDate } from '@/lib/utils/deadline'
import { HearingFormData } from '@/types/case'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  control: Control<HearingFormData>
  errors: Record<string, { message?: string }>
}

export function Step1Deceased({ control, errors }: Props) {
  const deathDate = useWatch({ control, name: 'deceased_death_date' })

  const deadline = (() => {
    if (!deathDate) return null
    const d = parseISO(deathDate)
    if (!isValid(d)) return null
    return addMonths(d, 10)
  })()

  const remainingDays = deadline ? differenceInDays(deadline, new Date()) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 1：被相続人の情報</h2>
        <p className="text-sm text-gray-500 mt-1">ご逝去された方の基本情報を入力してください</p>
      </div>

      {deadline && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-blue-800">📅 相続税の申告期限</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatJpDate(deadline)}</p>
            {remainingDays !== null && (
              <p className={`text-sm mt-1 font-medium ${remainingDays < 30 ? 'text-red-600' : remainingDays < 90 ? 'text-orange-600' : 'text-blue-600'}`}>
                {remainingDays < 0
                  ? `⚠️ 期限を${Math.abs(remainingDays)}日超過しています`
                  : `残り ${remainingDays} 日`}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-1">ご逝去日の翌日から10ヶ月以内</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="deceased_name">氏名（フリガナ）</Label>
          <Controller
            name="deceased_name"
            control={control}
            rules={{ required: '氏名を入力してください' }}
            render={({ field }) => (
              <Input {...field} id="deceased_name" placeholder="例：山田 太郎（ヤマダ タロウ）" className="mt-1" />
            )}
          />
          {errors.deceased_name && <p className="text-red-500 text-xs mt-1">{errors.deceased_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deceased_birth_date">生年月日</Label>
            <Controller
              name="deceased_birth_date"
              control={control}
              rules={{ required: '生年月日を入力してください' }}
              render={({ field }) => (
                <Input {...field} id="deceased_birth_date" type="date" className="mt-1" />
              )}
            />
            {errors.deceased_birth_date && <p className="text-red-500 text-xs mt-1">{errors.deceased_birth_date.message}</p>}
          </div>

          <div>
            <Label htmlFor="deceased_death_date">ご逝去日</Label>
            <Controller
              name="deceased_death_date"
              control={control}
              rules={{ required: 'ご逝去日を入力してください' }}
              render={({ field }) => (
                <Input {...field} id="deceased_death_date" type="date" className="mt-1" />
              )}
            />
            {errors.deceased_death_date && <p className="text-red-500 text-xs mt-1">{errors.deceased_death_date.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="deceased_address">ご逝去時の住所（最終住所）</Label>
          <Controller
            name="deceased_address"
            control={control}
            rules={{ required: '住所を入力してください' }}
            render={({ field }) => (
              <Input {...field} id="deceased_address" placeholder="例：東京都渋谷区〇〇町1-2-3" className="mt-1" />
            )}
          />
          {errors.deceased_address && <p className="text-red-500 text-xs mt-1">{errors.deceased_address.message}</p>}
        </div>
      </div>
    </div>
  )
}
