-- ポータルトークン列を追加
ALTER TABLE cases ADD COLUMN IF NOT EXISTS portal_token text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_cases_portal_token ON cases(portal_token);

-- 既存案件にトークンを付与（ランダム24文字）
UPDATE cases SET portal_token = encode(gen_random_bytes(18), 'base64') WHERE portal_token IS NULL;

-- ポータル経由の読み取りポリシー（トークンが一致する場合のみ）
CREATE POLICY "portal_cases_select" ON cases
  FOR SELECT USING (portal_token IS NOT NULL);

CREATE POLICY "portal_documents_select" ON documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.portal_token IS NOT NULL)
  );

CREATE POLICY "portal_documents_update" ON documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.portal_token IS NOT NULL)
  );

-- document_uploads ポータルINSERT許可
CREATE POLICY "portal_uploads_insert" ON document_uploads
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = document_uploads.case_id AND cases.portal_token IS NOT NULL)
  );

CREATE POLICY "portal_uploads_select" ON document_uploads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = document_uploads.case_id AND cases.portal_token IS NOT NULL)
  );
