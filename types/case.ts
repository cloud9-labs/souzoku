export type WillType = 'notarized' | 'holographic_self' | 'holographic_registry' | 'none'

export interface HeirEntry {
  name: string
  relationship: string
}

export type SmallLandType =
  | 'residential_spouse'
  | 'residential_cohabitant'
  | 'residential_homeless_child'
  | 'residential_nursing_home'
  | 'business'
  | 'rental'

export type DocumentStatus = 'not_requested' | 'requested' | 'received' | 'confirmed'

export type DocumentTier = 1 | 2 | 3

export interface Case {
  id: string
  user_id: string
  deceased_name: string
  deceased_birth_date: string
  deceased_death_date: string
  deceased_address: string
  filing_deadline: string
  has_spouse: boolean
  children_count: number
  has_adopted_children: boolean
  has_succession_renunciation: boolean
  will_type: WillType
  has_real_estate: boolean
  has_deposits: boolean
  has_listed_stocks: boolean
  has_unlisted_stocks: boolean
  has_life_insurance: boolean
  has_retirement_allowance: boolean
  has_farmland: boolean
  has_overseas_assets: boolean
  has_crypto: boolean
  has_debt: boolean
  small_land_types: SmallLandType[]
  apply_spouse_deduction: boolean
  has_prior_gifts: boolean
  has_souzoku_kazeijoken: boolean
  has_disabled_heir: boolean
  has_minor_heir: boolean
  client_name: string
  client_email: string
  client_relationship: string
  client_phone: string
  client_address: string
  heirs: HeirEntry[]
  status: 'active' | 'completed' | 'archived'
  portal_token?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  tier: DocumentTier
  category: string
  document_name: string
  obtain_from: string
  estimated_cost: string
  estimated_days: string
  notes: string
  why_needed: string
  status: DocumentStatus
  assignee: string | null
  due_date: string | null
  received_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentUpload {
  id: string
  document_id: string
  case_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

export interface Notification {
  id: string
  case_id: string
  notification_type: 'day_7' | 'day_30' | 'day_90' | 'day_240'
  sent_at: string
  recipient_email: string
}

export interface HeirCalculation {
  legal_heirs_count: number
  basic_deduction: number
  life_insurance_exempt: number
}

// ヒアリングウィザードのフォーム型
export interface HearingFormData {
  // STEP 1
  deceased_name: string
  deceased_birth_date: string
  deceased_death_date: string
  deceased_address: string
  // STEP 2
  has_spouse: boolean
  children_count: number
  has_adopted_children: boolean
  has_succession_renunciation: boolean
  will_type: WillType
  // STEP 3
  has_real_estate: boolean
  has_deposits: boolean
  has_listed_stocks: boolean
  has_unlisted_stocks: boolean
  has_life_insurance: boolean
  has_retirement_allowance: boolean
  has_farmland: boolean
  has_overseas_assets: boolean
  has_crypto: boolean
  has_debt: boolean
  // STEP 4
  small_land_types: SmallLandType[]
  apply_spouse_deduction: boolean
  has_prior_gifts: boolean
  has_souzoku_kazeijoken: boolean
  has_disabled_heir: boolean
  has_minor_heir: boolean
  // STEP 5
  client_name: string
  client_email: string
  client_relationship: string
  client_phone: string
  client_address: string
  // STEP 2 additions
  heirs: HeirEntry[]
}
