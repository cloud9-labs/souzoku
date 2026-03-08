import fs from 'fs'
import path from 'path'
import type { HearingFormData } from '@/types/case'

interface DevCaseData {
  formData: HearingFormData
  filing_deadline: string
}

const STORE_PATH = path.join(process.cwd(), '.dev-case-store.json')

export function saveDevCase(id: string, formData: HearingFormData, filing_deadline: string) {
  try {
    let store: Record<string, DevCaseData> = {}
    if (fs.existsSync(STORE_PATH)) {
      store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
    }
    store[id] = { formData, filing_deadline }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
  } catch {
    // ファイル書き込み失敗は無視
  }
}

export function getDevCase(id: string): DevCaseData | undefined {
  try {
    if (!fs.existsSync(STORE_PATH)) return undefined
    const store: Record<string, DevCaseData> = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
    return store[id]
  } catch {
    return undefined
  }
}
