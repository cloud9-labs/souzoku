-- ─────────────────────────────────────────
-- document_uploads テーブル
-- 各書類に対してアップロードされたファイルを管理
-- ─────────────────────────────────────────
CREATE TABLE document_uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  file_name text NOT NULL,
  file_path text NOT NULL,  -- Supabase Storage上のパス
  file_size integer NOT NULL,
  mime_type text NOT NULL,

  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- 自分の案件の書類のみ操作可能
CREATE POLICY "uploads_own_cases" ON document_uploads
  USING (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = document_uploads.case_id
    AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = document_uploads.case_id
    AND cases.user_id = auth.uid()
  ));

CREATE INDEX idx_document_uploads_document_id ON document_uploads(document_id);
CREATE INDEX idx_document_uploads_case_id ON document_uploads(case_id);

-- ─────────────────────────────────────────
-- Storage バケット＋ポリシー
-- ─────────────────────────────────────────

-- バケット作成（Supabase Dashboardで作成する場合は不要）
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-files', 'document-files', false)
ON CONFLICT (id) DO NOTHING;

-- アップロード: 認証済みユーザーが自分のcase_id配下にのみ保存可能
CREATE POLICY "storage_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'document-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 読み取り: 自分のcase_id配下のみ
CREATE POLICY "storage_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'document-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 削除: 自分のcase_id配下のみ
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'document-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
