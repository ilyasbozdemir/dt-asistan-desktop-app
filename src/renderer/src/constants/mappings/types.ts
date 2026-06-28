export interface TableColumnMapping {
  tablo?: string
  sutun?: string
  iliskili_id?: string // Aktif dosya ID'sine (activeDosyaId) göre filtreleme yapılacak kolon adı (örn: 'temin_dosya_id' veya 'id')
  deger?: any // Tablodan çekmek yerine doğrudan kullanılacak sabit değer
  varsayilan?: any // Tablodaki değer boş/null ise kullanılacak varsayılan değer
  altEslestirme?: Record<string, string> // Liste/tablo verilerinde satır sütunlarını şablon değişkenleriyle eşleştirmek için (örn: { malzemeAdi: 'kalem_adi' })
  formul?: string // Çoklu veritabanı alanını birleştirmek için şablon formülü (örn: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}')
  aciklama?: string
}

export interface ProcessMapping {
  [sablonDegiskeni: string]: TableColumnMapping
}
