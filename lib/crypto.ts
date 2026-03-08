import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTED_PREFIX = 'enc:'

function getKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) return null  // 32バイト = 64文字のhex
  return Buffer.from(key, 'hex')
}

/** テキストをAES-256-GCMで暗号化。ENCRYPTION_KEY未設定時は平文のまま返す */
export function encrypt(text: string): string {
  if (!text) return text
  const key = getKey()
  if (!key) return text  // キー未設定時はパススルー

  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/** 暗号化済みテキストを復号。enc:プレフィックスがない場合は平文のまま返す */
export function decrypt(text: string): string {
  if (!text || !text.startsWith(ENCRYPTED_PREFIX)) return text
  const key = getKey()
  if (!key) return text

  try {
    const withoutPrefix = text.slice(ENCRYPTED_PREFIX.length)
    const [ivHex, authTagHex, encryptedHex] = withoutPrefix.split(':')
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ])
    return decrypted.toString('utf8')
  } catch {
    return '[復号エラー]'
  }
}

/** オブジェクトをJSON化して暗号化 */
export function encryptJson(value: unknown): string {
  return encrypt(JSON.stringify(value))
}

/** 暗号化されたJSONを復号してパース */
export function decryptJson<T>(text: string, fallback: T): T {
  try {
    const decrypted = decrypt(text)
    return JSON.parse(decrypted) as T
  } catch {
    return fallback
  }
}

export function isEncrypted(text: string): boolean {
  return typeof text === 'string' && text.startsWith(ENCRYPTED_PREFIX)
}
