-- 拡張機能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- cases テーブル
-- ─────────────────────────────────────────
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 被相続人情報
  deceased_name text NOT NULL,
  deceased_birth_date date NOT NULL,
  deceased_death_date date NOT NULL,
  deceased_address text NOT NULL,

  -- 申告期限（死亡日+10ヶ月）
  filing_deadline date GENERATED ALWAYS AS (
    deceased_death_date + interval '10 months'
  ) STORED,

  -- 相続人情報
  has_spouse boolean NOT NULL DEFAULT false,
  children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0),
  has_adopted_children boolean NOT NULL DEFAULT false,
  has_succession_renunciation boolean NOT NULL DEFAULT false,
  will_type text NOT NULL DEFAULT 'none'
    CHECK (will_type IN ('notarized', 'holographic_self', 'holographic_registry', 'none')),

  -- 財産フラグ
  has_real_estate boolean NOT NULL DEFAULT false,
  has_deposits boolean NOT NULL DEFAULT false,
  has_listed_stocks boolean NOT NULL DEFAULT false,
  has_unlisted_stocks boolean NOT NULL DEFAULT false,
  has_life_insurance boolean NOT NULL DEFAULT false,
  has_retirement_allowance boolean NOT NULL DEFAULT false,
  has_farmland boolean NOT NULL DEFAULT false,
  has_overseas_assets boolean NOT NULL DEFAULT false,
  has_crypto boolean NOT NULL DEFAULT false,
  has_debt boolean NOT NULL DEFAULT false,

  -- 特例フラグ
  small_land_types text[] NOT NULL DEFAULT '{}',
  apply_spouse_deduction boolean NOT NULL DEFAULT false,
  has_prior_gifts boolean NOT NULL DEFAULT false,
  has_souzoku_kazeijoken boolean NOT NULL DEFAULT false,
  has_disabled_heir boolean NOT NULL DEFAULT false,
  has_minor_heir boolean NOT NULL DEFAULT false,

  -- 顧客情報
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',

  -- ステータス
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- documents テーブル
-- ─────────────────────────────────────────
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  tier integer NOT NULL CHECK (tier IN (1, 2, 3)),
  category text NOT NULL,
  document_name text NOT NULL,
  obtain_from text NOT NULL DEFAULT '',
  estimated_cost text NOT NULL DEFAULT '',
  estimated_days text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  why_needed text NOT NULL DEFAULT '',

  status text NOT NULL DEFAULT 'not_requested'
    CHECK (status IN ('not_requested', 'requested', 'received', 'confirmed')),
  assignee text,
  due_date date,
  received_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- notifications テーブル
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL
    CHECK (notification_type IN ('day_7', 'day_30', 'day_90', 'day_240')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_email text NOT NULL,
  UNIQUE (case_id, notification_type)
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_own_data" ON cases
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_own_cases" ON documents
  USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "notifications_own_cases" ON notifications
  USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = notifications.case_id AND cases.user_id = auth.uid()));

-- ─────────────────────────────────────────
-- updated_at 自動更新トリガー
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- インデックス
-- ─────────────────────────────────────────
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_filing_deadline ON cases(filing_deadline);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_notifications_case_id ON notifications(case_id);
