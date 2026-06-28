/**
 * DT Asistan — Desteklenen Dosya Formatları
 *
 * Tüm uzantılar burada tanımlanır.
 * Yeni bir format eklemek için bu dosyaya bir kayıt eklemek yeterlidir;
 * dialog filtreleri, argv kontrolü ve electron-builder config otomatik güncellenir.
 */

export interface FileFormat {
  /** Uzantı (nokta olmadan, örn: 'dtm') */
  ext: string
  /** Kullanıcıya gösterilecek açıklama */
  label: string
  /** Kısa açıklama (dialog filtresi adı) */
  dialogName: string
  /** Bu format varsayılan yeni dosya uzantısı mı? */
  isDefault?: boolean
}

export const SUPPORTED_FORMATS: FileFormat[] = [
  {
    ext: 'dtal',
    label: 'DT Asistan Lite Dosyası',
    dialogName: 'DT Asistan Lite Dosyası',
    isDefault: true
  },
  {
    ext: 'dta',
    label: 'Doğrudan Temin Asistan Veri Dosyası (Eski)',
    dialogName: 'Eski DT Asistan Dosyası'
  },
  {
    ext: 'dtm',
    label: 'Doğrudan Temin Veri Dosyası (Eski)',
    dialogName: 'Eski DT Asistan Dosyası'
  },
  {
    ext: 'dte',
    label: 'Doğrudan Temin Veri Aktarım Dosyası (Eski)',
    dialogName: 'Eski DT Veri Aktarım Dosyası'
  }
]

/** Tüm desteklenen uzantıları ['dtm', 'dta', ...] olarak döner */
export const allExtensions = SUPPORTED_FORMATS.map((f) => f.ext)

/** Varsayılan uzantı (yeni dosya oluştururken kullanılır) */
export const defaultFormat = SUPPORTED_FORMATS.find((f) => f.isDefault) ?? SUPPORTED_FORMATS[0]

/** Electron dialog filter listesi — tüm formatları tek grupta gösterir */
export const allFormatsFilter = {
  name: 'DT Asistan Dosyaları',
  extensions: allExtensions
}

/** Her format için ayrı ayrı dialog filter listesi */
export const perFormatFilters = SUPPORTED_FORMATS.map((f) => ({
  name: f.dialogName,
  extensions: [f.ext]
}))

/**
 * Verilen dosya yolunun desteklenen bir uzantıya sahip olup olmadığını kontrol eder.
 */
export function isSupportedFile(filePath: string): boolean {
  const lower = filePath.toLowerCase()
  return allExtensions.some((ext) => lower.endsWith('.' + ext))
}
