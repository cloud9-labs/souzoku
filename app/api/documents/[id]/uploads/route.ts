import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === 'true'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (DEV_BYPASS) {
    return NextResponse.json([])
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { data, error } = await supabase
    .from('document_uploads')
    .select('*')
    .eq('document_id', id)
    .order('uploaded_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  if (DEV_BYPASS) {
    return NextResponse.json({ error: '開発モードではファイルアップロードは利用できません。Supabaseに接続後ご利用ください。' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  // 対象書類の case_id を取得（権限確認）
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('case_id')
    .eq('id', documentId)
    .single()

  if (docError || !doc) return NextResponse.json({ error: '書類が見つかりません' }, { status: 404 })

  // 自分の案件か確認
  const { data: caseData } = await supabase
    .from('cases')
    .select('id')
    .eq('id', doc.case_id)
    .eq('user_id', user.id)
    .single()

  if (!caseData) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })

  // ファイルサイズ制限（10MB）
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
  }

  // MIMEタイプ確認
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'PDF・JPEG・PNG・WebPのみアップロード可能です' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${doc.case_id}/${documentId}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('document-files')
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: record, error: insertError } = await supabase
    .from('document_uploads')
    .insert({
      document_id: documentId,
      case_id: doc.case_id,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // ファイルアップロード時に書類ステータスを「受取済」に更新
  await supabase
    .from('documents')
    .update({ status: 'received', received_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('status', 'not_requested')  // 未依頼の場合のみ

  return NextResponse.json(record, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const { searchParams } = new URL(req.url)
  const uploadId = searchParams.get('uploadId')
  if (!uploadId) return NextResponse.json({ error: 'uploadIdが必要です' }, { status: 400 })

  if (DEV_BYPASS) {
    return NextResponse.json({ error: '開発モードでは利用できません' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { data: upload } = await supabase
    .from('document_uploads')
    .select('file_path, case_id')
    .eq('id', uploadId)
    .eq('document_id', documentId)
    .single()

  if (!upload) return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 })

  await supabase.storage.from('document-files').remove([upload.file_path])
  await supabase.from('document_uploads').delete().eq('id', uploadId)

  return NextResponse.json({ ok: true })
}
