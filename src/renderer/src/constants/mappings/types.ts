export interface TableColumnMapping {
  tablo: string
  sutun: string
  iliskili_id?: string // Aktif dosya ID'sine (activeDosyaId) göre filtreleme yapılacak kolon adı (örn: 'temin_dosya_id' veya 'id')
  aciklama?: string
}

export interface ProcessMapping {
  [sablonDegiskeni: string]: TableColumnMapping
}
