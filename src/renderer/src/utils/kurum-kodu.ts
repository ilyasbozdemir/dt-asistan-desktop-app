export type KurumKoduFormat = 'eski' | 'yeni' | 'bilinmiyor'

export interface KurumKodu {
  ham: string // girilen ham değer
  format: KurumKoduFormat
  yeni?: string // Noktalı ayrılmış 4 parça
  eski?: string // Tire ile ayrılmış
}

export function kurumKoduAlgila(input: string): KurumKodu {
  const temiz = input.trim()

  // Eski format: sadece rakam ve tire, nokta yok
  const eskiRegex = /^\d{5}-\d{2}$/

  // Yeni format: nokta ile ayrılmış 4 parça
  const yeniRegex = /^\d{2}\.\d{2}\.\d{2}\.\d{2}$/

  if (eskiRegex.test(temiz)) {
    return {
      ham: temiz,
      format: 'eski',
      eski: temiz
    }
  }

  if (yeniRegex.test(temiz)) {
    return {
      ham: temiz,
      format: 'yeni',
      yeni: temiz
    }
  }

  return {
    ham: temiz,
    format: 'bilinmiyor'
  }
}

// Mapping tablosu DB'de veya çevresel değişkenlerde tutulmalıdır.
// Güvenlik ve gizlilik sebepleriyle kod içinde sabit (hardcoded) veri bırakılmamıştır.
const formatMap: Record<string, string> = {
  // 'EskiFormat': 'YeniFormat'
}

export function eskidenYeniye(eski: string): string | null {
  return formatMap[eski] ?? null
}

export function yenidentEskiye(yeni: string): string | null {
  return Object.entries(formatMap).find(([_, v]) => v === yeni)?.[0] ?? null
}
