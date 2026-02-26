import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const body = await req.json()

  // RLSがdocuments→casesのuser_idを検証するため、直接更新可能
  const updateData: Record<string, unknown> = { status: body.status }
  if (body.status === 'received') updateData.received_at = new Date().toISOString()
  if (body.assignee !== undefined) updateData.assignee = body.assignee
  if (body.due_date !== undefined) updateData.due_date = body.due_date

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
