import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { workspaceManager } from '../database/workspace'

export interface AIGenerateOptions {
  prompt: string
  systemInstruction?: string
}

export interface AIResult {
  success: boolean
  data?: string
  error?: string
}

// ─── Ortak yardımcı: Settings'ten anahtar çek ─────────────────────────────
function getSetting(key: string): string | undefined {
  try {
    const db = workspaceManager.getDb()
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined
    return row?.value
  } catch {
    return undefined
  }
}

// ─── Gemini ────────────────────────────────────────────────────────────────
async function generateWithGemini(options: AIGenerateOptions, apiKey: string): Promise<AIResult> {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: options.prompt,
    config: options.systemInstruction
      ? { systemInstruction: options.systemInstruction }
      : undefined
  })
  return { success: true, data: response.text }
}

// ─── OpenAI ────────────────────────────────────────────────────────────────
async function generateWithOpenAI(options: AIGenerateOptions, apiKey: string): Promise<AIResult> {
  const client = new OpenAI({ apiKey })
  const messages: OpenAI.ChatCompletionMessageParam[] = []
  if (options.systemInstruction) {
    messages.push({ role: 'system', content: options.systemInstruction })
  }
  messages.push({ role: 'user', content: options.prompt })

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages
  })
  return { success: true, data: response.choices[0]?.message?.content ?? '' }
}

// ─── Anthropic ─────────────────────────────────────────────────────────────
async function generateWithAnthropic(
  options: AIGenerateOptions,
  apiKey: string
): Promise<AIResult> {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    system: options.systemInstruction,
    messages: [{ role: 'user', content: options.prompt }]
  })
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')
  return { success: true, data: text }
}

// ─── Ana üretim fonksiyonu ─────────────────────────────────────────────────
export async function generateContent(options: AIGenerateOptions): Promise<AIResult> {
  try {
    const provider = getSetting('ai_provider') || 'gemini'

    if (provider === 'gemini') {
      const apiKey = getSetting('ai_gemini_api_key')
      if (!apiKey)
        return {
          success: false,
          error: 'Google Gemini API Anahtarı bulunamadı. Lütfen ayarlardan yapılandırın.'
        }
      return await generateWithGemini(options, apiKey)
    }

    if (provider === 'openai') {
      const apiKey = getSetting('ai_openai_api_key')
      if (!apiKey)
        return {
          success: false,
          error: 'OpenAI API Anahtarı bulunamadı. Lütfen ayarlardan yapılandırın.'
        }
      return await generateWithOpenAI(options, apiKey)
    }

    if (provider === 'anthropic') {
      const apiKey = getSetting('ai_anthropic_api_key')
      if (!apiKey)
        return {
          success: false,
          error: 'Anthropic API Anahtarı bulunamadı. Lütfen ayarlardan yapılandırın.'
        }
      return await generateWithAnthropic(options, apiKey)
    }

    return { success: false, error: 'Seçili yapay zeka sağlayıcısı desteklenmiyor.' }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Yapay zeka ile iletişim kurulurken hata.'
    console.error('AI Generate Error:', error)
    return { success: false, error: msg }
  }
}

// ─── Bağlantı testi ────────────────────────────────────────────────────────
export interface AITestOptions {
  provider: string
  apiKey: string
}

export async function testConnection(opts: AITestOptions): Promise<AIResult> {
  const { provider, apiKey } = opts
  const testPrompt = 'Merhaba! Bağlantı testi. Sadece "OK" yaz.'

  try {
    if (provider === 'gemini') {
      return await generateWithGemini({ prompt: testPrompt }, apiKey)
    }
    if (provider === 'openai') {
      return await generateWithOpenAI({ prompt: testPrompt }, apiKey)
    }
    if (provider === 'anthropic') {
      return await generateWithAnthropic({ prompt: testPrompt }, apiKey)
    }
    return { success: false, error: 'Bilinmeyen sağlayıcı.' }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bağlantı testi başarısız.'
    console.error('AI Test Error:', error)
    return { success: false, error: msg }
  }
}
