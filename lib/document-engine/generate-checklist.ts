import type { Case } from '@/types/case'
import {
  TIER1_DOCUMENTS,
  TIER2_DOCUMENTS,
  TIER3_DOCUMENTS,
  type DocumentDefinition,
} from './document-master'

/**
 * 案件情報から必要書類リストを自動生成する条件分岐エンジン
 * 純粋関数として実装 - 同じ入力に対して常に同じ出力を返す
 */
export function generateChecklist(caseData: Partial<Case>): DocumentDefinition[] {
  const documents: DocumentDefinition[] = []

  // ─── TIER 1: 全案件共通 ────────────────────────────────
  documents.push(...TIER1_DOCUMENTS)

  // ─── TIER 2: 財産種類別 ────────────────────────────────
  if (caseData.has_real_estate) documents.push(...TIER2_DOCUMENTS.real_estate)
  if (caseData.has_deposits) documents.push(...TIER2_DOCUMENTS.deposits)
  if (caseData.has_listed_stocks) documents.push(...TIER2_DOCUMENTS.listed_stocks)
  if (caseData.has_unlisted_stocks) documents.push(...TIER2_DOCUMENTS.unlisted_stocks)
  if (caseData.has_life_insurance) documents.push(...TIER2_DOCUMENTS.life_insurance)
  if (caseData.has_retirement_allowance) documents.push(...TIER2_DOCUMENTS.retirement_allowance)
  if (caseData.has_farmland) documents.push(...TIER2_DOCUMENTS.farmland)
  if (caseData.has_overseas_assets) documents.push(...TIER2_DOCUMENTS.overseas_assets)
  if (caseData.has_crypto) documents.push(...TIER2_DOCUMENTS.crypto)
  if (caseData.has_debt) documents.push(...TIER2_DOCUMENTS.debt)

  // ─── TIER 3: 遺言書・特例別 ────────────────────────────
  switch (caseData.will_type) {
    case 'none':
      documents.push(...TIER3_DOCUMENTS.will_none)
      break
    case 'holographic_self':
      documents.push(...TIER3_DOCUMENTS.will_holographic_self)
      break
    case 'holographic_registry':
      documents.push(...TIER3_DOCUMENTS.will_holographic_registry)
      break
    case 'notarized':
      // 公正証書遺言は写しのみ（TIER1で充足）
      break
  }

  if (caseData.has_succession_renunciation) {
    documents.push(...TIER3_DOCUMENTS.renunciation)
  }

  const smallLandTypes = caseData.small_land_types ?? []
  for (const landType of smallLandTypes) {
    if (landType === 'residential_cohabitant') documents.push(...TIER3_DOCUMENTS.small_land_cohabitant)
    if (landType === 'residential_homeless_child') documents.push(...TIER3_DOCUMENTS.small_land_homeless_child)
    if (landType === 'residential_nursing_home') documents.push(...TIER3_DOCUMENTS.small_land_nursing_home)
    if (landType === 'business') documents.push(...TIER3_DOCUMENTS.small_land_business)
    if (landType === 'rental') documents.push(...TIER3_DOCUMENTS.small_land_rental)
  }

  if (caseData.has_prior_gifts) documents.push(...TIER3_DOCUMENTS.prior_gifts)
  if (caseData.has_souzoku_kazeijoken) documents.push(...TIER3_DOCUMENTS.souzoku_kazeijoken)
  if (caseData.has_disabled_heir) documents.push(...TIER3_DOCUMENTS.disabled_heir)
  if (caseData.has_minor_heir) documents.push(...TIER3_DOCUMENTS.minor_heir)

  // 重複除去
  const seen = new Set<string>()
  return documents.filter((doc) => {
    if (seen.has(doc.id)) return false
    seen.add(doc.id)
    return true
  })
}

/** 法定相続人数・基礎控除額・非課税枠の計算 */
export function calculateHeirInfo(caseData: Pick<Case, 'has_spouse' | 'children_count'>) {
  const legalHeirsCount = (caseData.has_spouse ? 1 : 0) + (caseData.children_count ?? 0)
  const basicDeduction = 3000 + 600 * legalHeirsCount
  const lifeInsuranceExempt = 500 * legalHeirsCount
  return { legal_heirs_count: legalHeirsCount, basic_deduction: basicDeduction, life_insurance_exempt: lifeInsuranceExempt }
}

/** カテゴリ別・TIER別進捗率計算 */
export function calculateProgress(documents: (DocumentDefinition & { status: string })[]) {
  return ([1, 2, 3] as const).map((tier) => {
    const tierDocs = documents.filter((d) => d.tier === tier)
    if (tierDocs.length === 0) return { tier, total: 0, received: 0, confirmed: 0, rate: 100 }
    const received = tierDocs.filter((d) => d.status === 'received' || d.status === 'confirmed').length
    const confirmed = tierDocs.filter((d) => d.status === 'confirmed').length
    return { tier, total: tierDocs.length, received, confirmed, rate: Math.round((received / tierDocs.length) * 100) }
  })
}
