'use client'

import { useState } from 'react'
import { Control, Controller, UseFormSetValue } from 'react-hook-form'
import { HearingFormData } from '@/types/case'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  control: Control<HearingFormData>
  errors: Record<string, { message?: string }>
  setValue: UseFormSetValue<HearingFormData>
}

const RELATIONSHIP_OPTIONS = [
  '配偶者', '長男', '次男', '三男', '長女', '次女', '三女',
  '養子', '孫', '父', '母', '兄', '弟', '姉', '妹', 'その他',
]

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

export function Step5Current({ control, errors, setValue }: Props) {
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
          setValue('client_address', address, { shouldValidate: true })
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 1：ご依頼者の情報</h2>
        <p className="text-sm text-gray-500 mt-1">ご依頼者様の連絡先情報を入力してください</p>
      </div>

      <div className="space-y-4">
        {/* 氏名 */}
        <div>
          <Label htmlFor="client_name">お名前</Label>
          <Controller name="client_name" control={control}
            rules={{ required: 'お名前を入力してください' }}
            render={({ field }) => (
              <Input {...field} id="client_name" placeholder="例：山田 花子" className="mt-1" />
            )}
          />
          {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name.message}</p>}
        </div>

        {/* 被相続人との続柄 */}
        <div>
          <Label htmlFor="client_relationship">被相続人との続柄</Label>
          <Controller name="client_relationship" control={control}
            rules={{ required: '続柄を選択してください' }}
            render={({ field }) => (
              <select
                {...field}
                id="client_relationship"
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">選択してください</option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          />
          {errors.client_relationship && <p className="text-red-500 text-xs mt-1">{errors.client_relationship.message}</p>}
        </div>

        {/* 電話番号 */}
        <div>
          <Label htmlFor="client_phone">電話番号</Label>
          <Controller name="client_phone" control={control}
            rules={{
              required: '電話番号を入力してください',
              pattern: { value: /^[\d\-+() ]{10,15}$/, message: '正しい電話番号を入力してください' },
            }}
            render={({ field }) => (
              <Input {...field} id="client_phone" type="tel" placeholder="例：090-1234-5678" className="mt-1" />
            )}
          />
          {errors.client_phone && <p className="text-red-500 text-xs mt-1">{errors.client_phone.message}</p>}
        </div>

        {/* メールアドレス */}
        <div>
          <Label htmlFor="client_email">メールアドレス（書類リマインダーの送付先）</Label>
          <Controller name="client_email" control={control}
            rules={{
              required: 'メールアドレスを入力してください',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '正しいメールアドレスを入力してください' },
            }}
            render={({ field }) => (
              <Input {...field} id="client_email" type="email" placeholder="例：hanako@example.com" className="mt-1" />
            )}
          />
          {errors.client_email && <p className="text-red-500 text-xs mt-1">{errors.client_email.message}</p>}
          <p className="text-xs text-gray-500 mt-1">
            申告期限30日前・90日前・240日前に自動でリマインダーメールが送信されます
          </p>
        </div>

        {/* 郵便番号 */}
        <div>
          <Label htmlFor="client_postal_code">郵便番号</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="client_postal_code"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="例：150-0041"
              maxLength={8}
              className="w-40"
            />
            {isLookingUp && <span className="text-xs text-gray-500">検索中...</span>}
            {lookupError && <span className="text-xs text-red-500">{lookupError}</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">7桁入力で住所を自動入力します</p>
        </div>

        {/* 住所 */}
        <div>
          <Label htmlFor="client_address">ご住所</Label>
          <Controller name="client_address" control={control}
            rules={{ required: '住所を入力してください' }}
            render={({ field }) => (
              <Input {...field} id="client_address" placeholder="例：東京都渋谷区〇〇町1-2-3" className="mt-1" />
            )}
          />
          {errors.client_address && <p className="text-red-500 text-xs mt-1">{errors.client_address.message}</p>}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-amber-800">📌 入力完了後の流れ</p>
        <ol className="text-xs text-amber-700 mt-2 space-y-1 list-decimal list-inside">
          <li>入力内容をもとに必要書類チェックリストが自動生成されます</li>
          <li>各書類の収集状況をステータス管理できます</li>
          <li>申告期限に合わせてリマインダーメールが自動送信されます</li>
        </ol>
        <p className="text-xs text-amber-600 mt-2">
          ※ 本システムは書類収集の管理支援ツールです。申告書の作成・税務判断は担当税理士にご確認ください。
        </p>
      </div>
    </div>
  )
}
