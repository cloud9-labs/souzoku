'use client'

import { useState } from 'react'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'
import { addMonths, differenceInDays, parseISO, isValid } from 'date-fns'
import { formatJpDate } from '@/lib/utils/deadline'
import { HearingFormData } from '@/types/case'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  control: Control<HearingFormData>
  errors: Record<string, { message?: string }>
  setValue: UseFormSetValue<HearingFormData>
}

async function fetchAddressByPostalCode(code: string): Promise<string | null> {
  const digits = code.replace(/-/g, '')
  if (digits.length !== 7) return null
  const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`)
  if (!res.ok) return null
  const json = await res.json()
  if (!json.results?.[0]) return null
  const { address1, address2, address3 } = json.results[0]
  return `${address1}${address2}${address3}`
}

export function Step1Deceased({ control, errors, setValue }: Props) {
  const [postalCode, setPostalCode] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState('')

  const handlePostalCodeChange = async (value: string) => {
    const formatted = value.replace(/[^0-9-]/g, '')
    setPostalCode(formatted)
    setLookupError('')

    const digits = formatted.replace(/-/g, '')
    if (digits.length === 7) {
      setIsLookingUp(true)
      try {
        const address = await fetchAddressByPostalCode(digits)
        if (address) {
          setValue('deceased_address', address, { shouldValidate: true })
        } else {
          setLookupError('住所が見つかりませんでした')
        }
      } catch {
        setLookupError('住所の取得に失敗しました')
      } finally {
        setIsLookingUp(false)
      }
    }
  }

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
        <h2 className="text-xl font-bold text-gray-800">STEP 2：被相続人の情報</h2>
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
          <Label htmlFor="deceased_postal_code">郵便番号</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="deceased_postal_code"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="例：150-0041"
              maxLength={8}
              className="w-40"
            />
            {isLookingUp && <span className="text-xs text-gray-500">検索中...</span>}
            {lookupError && <span className="text-xs text-red-500">{lookupError}</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">7桁入力で住所を自動入力します（ハイフンあり・なし両対応）</p>
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
