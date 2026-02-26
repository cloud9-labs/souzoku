'use client'

import { Control, Controller } from 'react-hook-form'
import { HearingFormData } from '@/types/case'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  control: Control<HearingFormData>
  errors: Record<string, { message?: string }>
}

export function Step5Current({ control, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">STEP 5：ご依頼者の情報</h2>
        <p className="text-sm text-gray-500 mt-1">書類のリマインダーメールを送信するための情報を入力してください</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="client_name">ご依頼者様のお名前</Label>
          <Controller name="client_name" control={control}
            rules={{ required: 'お名前を入力してください' }}
            render={({ field }) => (
              <Input {...field} id="client_name" placeholder="例：山田 花子" className="mt-1" />
            )}
          />
          {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name.message}</p>}
        </div>

        <div>
          <Label htmlFor="client_email">メールアドレス（書類リマインダーの送付先）</Label>
          <Controller name="client_email" control={control}
            rules={{
              required: 'メールアドレスを入力してください',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '正しいメールアドレスを入力してください' }
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
