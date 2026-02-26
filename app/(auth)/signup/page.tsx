'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/` },
    })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-2xl mb-3">📧</p>
          <h2 className="font-bold text-lg">確認メールを送信しました</h2>
          <p className="text-sm text-gray-500 mt-2">
            {email} 宛にメールを送信しました。<br />
            リンクをクリックしてアカウントを有効化してください。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">パスワード（12文字以上推奨）</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          既にアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-blue-600 hover:underline">ログイン</Link>
        </p>
      </CardContent>
    </Card>
  )
}
