'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { DocumentUpload } from '@/types/case'

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_URL === ''

interface Props {
  documentId: string
  onUploaded?: () => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function FileUploadArea({ documentId, onUploaded }: Props) {
  const [uploads, setUploads] = useState<DocumentUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchUploads = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}/uploads`)
    if (res.ok) setUploads(await res.json())
  }, [documentId])

  useEffect(() => {
    if (open) fetchUploads()
  }, [open, fetchUploads])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/documents/${documentId}/uploads`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'アップロードに失敗しました')
      } else {
        await fetchUploads()
        onUploaded?.()
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleView = async (upload: DocumentUpload) => {
    const res = await fetch(`/api/documents/${documentId}/uploads/signed-url?path=${encodeURIComponent(upload.file_path)}`)
    if (!res.ok) { alert('ファイルを開けませんでした'); return }
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  const handleDelete = async (uploadId: string) => {
    if (!confirm('このファイルを削除しますか？')) return
    await fetch(`/api/documents/${documentId}/uploads?uploadId=${uploadId}`, { method: 'DELETE' })
    await fetchUploads()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
      >
        📎 書類をアップロード{uploads.length > 0 && ` (${uploads.length}件)`}
      </button>
    )
  }

  return (
    <div className="mt-3 border border-blue-100 rounded-lg bg-blue-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-blue-800">📎 書類ファイル</p>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">▲ 閉じる</button>
      </div>

      {DEV_MODE ? (
        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
          ⚠️ 開発モード：Supabase接続後にご利用いただけます
        </p>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-xs text-blue-600 hover:border-blue-500 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {uploading ? 'アップロード中...' : '＋ PDF / JPEG / PNG を選択'}
          </button>
          <p className="text-xs text-gray-400 mt-1">最大10MB</p>
        </>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {uploads.length > 0 && (
        <div className="mt-2 space-y-1">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-2 bg-white rounded px-2 py-1.5 border border-blue-200">
              <span className="text-xs">
                {u.mime_type === 'application/pdf' ? '📄' : '🖼️'}
              </span>
              <button
                onClick={() => handleView(u)}
                className="text-xs text-blue-700 hover:underline flex-1 text-left truncate"
              >
                {u.file_name}
              </button>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(u.file_size)}</span>
              <button
                onClick={() => handleDelete(u.id)}
                className="text-xs text-gray-300 hover:text-red-500 shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
