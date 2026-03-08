import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ファイル閲覧用の一時署名付きURLを発行
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')
  if (!filePath) return NextResponse.json({ error: 'pathが必要です' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  // user_idで始まるパスのみ許可
  if (!filePath.startsWith(user.id + '/')) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { data, error } = await supabase.storage
    .from('document-files')
    .createSignedUrl(filePath, 60 * 60) // 1時間有効

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
