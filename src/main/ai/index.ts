import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { workspaceManager } from '../database/workspace'

export interface AIGenerateOptions {
  prompt: string
  systemInstruction?: string
  enableDatabaseAccess?: boolean
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
    config: options.systemInstruction ? { systemInstruction: options.systemInstruction } : undefined
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

// ─── Internal Provider Wrapper ───────────────────────────────────────────────
async function callProvider(options: AIGenerateOptions): Promise<AIResult> {
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
}

// ─── Ana üretim fonksiyonu (Agentic Loop eklendi) ──────────────────────────
export async function generateContent(options: AIGenerateOptions): Promise<AIResult> {
  try {
    let finalOptions = { ...options }

    const aiIdentity =
      'Sen bir Kamu İhale ve Muhasebe Uzmanısın (Doğrudan Temin - DT). Kullanıcı sana soru sorduğunda veya form incelemesi yaptığında, muhasebe diline (ekonomik kod, bütçe türü, fonksiyonel kod, KDV hesabı vb.) ve Kamu İhale Kanununa (özellikle 22/d) hakim olduğunu göstererek profesyonelce yanıt ver. Analizlerinde tutarsızlıkları bul ve net öneriler sun.'

    finalOptions.systemInstruction = finalOptions.systemInstruction
      ? `${aiIdentity}\n\nEk Talimat: ${finalOptions.systemInstruction}`
      : aiIdentity

    if (options.enableDatabaseAccess) {
      const schema = workspaceManager.getDatabaseSchema()
      if (schema) {
        const dbInstruction = `\n\nVERİTABANI ERİŞİMİ (Agent Modu):\nAşağıdaki SQLite veritabanı şemasına sahipsin:\n${schema}\n\nEğer kullanıcının isteğine cevap verebilmek veya analiz yapabilmek için veritabanında sorgulama yapman GEREKİYORSA, cevabına SADECE aşağıdaki formatta bir SQL sorgusu yaz:\n<SQL>SELECT * FROM dosyalar LIMIT 50</SQL>\n\nKurallar:\n1. Sorguyu <SQL> ve </SQL> etiketleri arasına al. Başka hiçbir kelime veya açıklama yazma.\n2. Sistem arka planda bu sorguyu senin yerine çalıştıracak ve sana sonucunu (JSON olarak) yeni bir mesajda iletecektir.\n3. Sonucu aldıktan sonra, o verilere dayanarak kullanıcıya detaylı, okunabilir, asıl istediği nihai cevabı üret (Markdown kullan).\n4. Güvenlik: Sadece SELECT sorgusu atabilirsin. UPDATE, INSERT, DELETE, DROP gibi sorgular KESİNLİKLE yasaktır!\n5. Performans: Çok fazla veri dönmemesi için liste veya detay isterse sorgularına otomatik LIMIT 50 ekle. Sadece Toplam, Ortalama, Sayı vs gerekiyorsa (SUM, COUNT vb) LIMIT koymana gerek yok.\n\nEğer soru veritabanı gerektirmiyorsa veya sana zaten "Sorgu Sonucu" verilmişse, doğrudan normal cevabını yaz.`
        finalOptions.systemInstruction = (finalOptions.systemInstruction || '') + dbInstruction
      }
    }

    let result = await callProvider(finalOptions)

    // Check for <SQL> block if success
    if (result.success && result.data && result.data.includes('<SQL>')) {
      const sqlMatch = result.data.match(/<SQL>([\s\S]*?)<\/SQL>/)
      if (sqlMatch) {
        let sql = sqlMatch[1].trim()

        // Basic Security Check
        const upperSql = sql.toUpperCase()
        if (
          upperSql.includes('INSERT ') ||
          upperSql.includes('UPDATE ') ||
          upperSql.includes('DELETE ') ||
          upperSql.includes('DROP ') ||
          upperSql.includes('ALTER ')
        ) {
          return {
            success: false,
            error: 'Güvenlik İhlali: AI sadece okuma (SELECT) yapabilir. Zararlı SQL engellendi.'
          }
        }

        try {
          const db = workspaceManager.getDb()
          const dbResult = db.prepare(sql).all()

          // Limit response length to prevent token overflow
          let dbResultStr = JSON.stringify(dbResult)
          if (dbResultStr.length > 20000) {
            dbResultStr =
              dbResultStr.substring(0, 20000) + '... (veri çok uzun olduğu için kesildi)'
          }

          // Trigger Loop: Send DB results back to AI
          const secondPrompt = `Kullanıcının asıl isteği: "${options.prompt}"\n\nSenin çalıştırdığın arka plan SQL sorgusu: "${sql}"\n\nSorgu Sonucu: ${dbResultStr}\n\nLütfen sadece yukarıdaki "Sorgu Sonucu" verilerini kullanarak, kullanıcının asıl isteğine okunabilir, detaylı bir cevap üret. Sonuçları listelerken veya analiz ederken şık bir Markdown (listeler, tablolar veya kalın/italik) kullanabilirsin.`

          finalOptions.prompt = secondPrompt
          result = await callProvider(finalOptions)
        } catch (dbErr: any) {
          // If DB throws an error (e.g. syntax error), ask AI to explain it or try without DB
          const errorPrompt = `Kullanıcının isteği: "${options.prompt}"\n\nYazdığın SQL sorgusu (${sql}) sistemde şu hatayı verdi: ${dbErr.message}\n\nLütfen hatanın nedenini kendi kendine analiz et ve soruyu veritabanı olmadan yanıtla veya kullanıcıya uygun bir dille açıklama yap.`
          finalOptions.prompt = errorPrompt
          result = await callProvider(finalOptions)
        }
      }
    }

    return result
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
