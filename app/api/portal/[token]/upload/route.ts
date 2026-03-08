import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const supabase = createAdminClient()

  // トークンで案件を検索
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id')
    .eq('portal_token', token)
    .single()

  if (caseError || !caseData) {
    return NextResponse.json({ error: '無効なURLです' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const documentId = formData.get('documentId') as string | null

  if (!file) return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
  if (!documentId) return NextResponse.json({ error: '書類IDが必要です' }, { status: 400 })

  // ファイルサイズ制限（10MB）
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
  }

  // MIMEタイプ確認
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'PDF・JPEG・PNG・WebPのみアップロード可能です' }, { status: 400 })
  }

  // 書類がこの案件に属するか確認
  const { data: doc } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('case_id', caseData.id)
    .single()

  if (!doc) return NextResponse.json({ error: '書類が見つかりません' }, { status: 404 })

  const ext = file.name.split('.').pop()
  const storagePath = `portal/${caseData.id}/${documentId}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('document-files')
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // document_uploads に記録
  const { data: record, error: insertError } = await supabase
    .from('document_uploads')
    .insert({
      document_id: documentId,
      case_id: caseData.id,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // 書類ステータスを「受取済」に更新
  await supabase
    .from('documents')
    .update({ status: 'received', received_at: new Date().toISOString() })
    .eq('id', documentId)
    .in('status', ['not_requested', 'requested'])

  return NextResponse.json(record, { status: 201 })
}
