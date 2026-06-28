export interface TemplateVariableDef {
  label: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date'
  description?: string
  kaynak_tablo?: string
  kaynak_sutun?: string
  varsayilan?: string
}

export const TemplateVariablesSchema: Record<string, TemplateVariableDef> = {
  // Veritabanı ve Şablon Kaynaklı Tüm Değişkenler
  firma_adi: {
    label: 'İstekli Firma Adı',
    type: 'string',
    kaynak_tablo: 'TANIM_Firma',
    kaynak_sutun: 'unvan',
    varsayilan: 'Firma A.Ş.',
    description: 'Temin edilecek firmanın ticari ünvanı'
  },
  firma_vkn: {
    label: 'Vergi No / TCKN',
    type: 'string',
    kaynak_tablo: 'TANIM_Firma',
    kaynak_sutun: 'vergi_no',
    description: 'Firmanın vergi numarası'
  },
  tarih: {
    label: 'Tarih',
    type: 'date',
    varsayilan: '01.01.2024',
    description: 'Belgenin oluşturulduğu tarih'
  },
  dosyaTarihi: { label: 'Dosya Tarihi', type: 'date', varsayilan: '01.01.2024' },
  kurumIci: { label: 'Kurum İçi Mi?', type: 'boolean', varsayilan: 'false' },
  evrakSayisi: { label: 'Evrak Sayısı', type: 'string', varsayilan: 'E-12345' },
  sunulacakMakamAdi: { label: 'Sunulacak Makam Adı', type: 'string', varsayilan: 'MAKAM ONAYINA' },
  dosyaKonusu: { label: 'Dosya Konusu', type: 'string', varsayilan: 'Alım İşi' },
  hazirlayanPersonelAdi: {
    label: 'Hazırlayan Personel Adı',
    type: 'string',
    varsayilan: 'Ahmet Yılmaz'
  },
  hazirlayanPersonelUnvan: {
    label: 'Hazırlayan Personel Ünvanı',
    type: 'string',
    varsayilan: 'Memur'
  },
  onaylayanPersonelAdi: {
    label: 'Onaylayan Personel Adı',
    type: 'string',
    varsayilan: 'Ayşe Kaya'
  },
  onaylayanPersonelUnvan: {
    label: 'Onaylayan Personel Ünvanı',
    type: 'string',
    varsayilan: 'Müdür'
  },
  ilgiliPersonelAdi: { label: 'İlgili Personel Adı', type: 'string', varsayilan: 'Veli Demir' },
  ilgiliPersonelUnvan: { label: 'İlgili Personel Ünvanı', type: 'string' },
  kurumumuz: { label: 'Kurumumuz Soneki', type: 'string', varsayilan: 'Kurumumuz' },
  kurumunuz: { label: 'Kurumunuz Soneki', type: 'string', varsayilan: 'Kurumunuz' },
  kurumu: { label: 'Kurumu Soneki', type: 'string', varsayilan: 'Kurumu' },
  kurumlari: { label: 'Kurumları Soneki', type: 'string', varsayilan: 'Kurumları' },
  kalemSayisi: { label: 'Kalem Sayısı', type: 'number', varsayilan: '2' },
  kalemSayisiYazi: { label: 'Kalem Sayısı (Yazı)', type: 'string', varsayilan: 'İki' },
  toplam_tutar: {
    label: 'Toplam Tutar',
    type: 'string',
    kaynak_tablo: 'DATA_TeminDosyasi',
    kaynak_sutun: 'yaklasik_maliyet',
    description: 'Dosyanın toplam tutarı'
  },
  antetSatirlari: { label: 'Antet Satırları', type: 'array' },
  talepEdenPersonelAdi: { label: 'Talep Eden Personel Adı', type: 'string' },
  talepEdenPersonelUnvan: { label: 'Talep Eden Personel Ünvanı', type: 'string' },
  kurumAdres: { label: 'Kurum Adresi', type: 'string' },
  kurumTelefon: { label: 'Kurum Telefonu', type: 'string' },
  kurumFaks: { label: 'Kurum Faks', type: 'string' },
  kurumWeb: { label: 'Kurum Web Sitesi', type: 'string' },
  kurumEposta: { label: 'Kurum E-Posta', type: 'string' },
  kurumKep: { label: 'Kurum KEP Adresi', type: 'string' },
  solLogo: { label: 'Sol Logo URL', type: 'string' },
  sagLogo: { label: 'Sağ Logo URL', type: 'string' },
  ihtiyacYeri: { label: 'İhtiyaç Yeri', type: 'string' },
  ihtiyacKalemleri: {
    label: 'İhtiyaç Kalemleri',
    type: 'array',
    description: 'Kodu, Malzeme Adı, Miktar gibi detayları içerir.'
  },
  olurYazisi: { label: 'Olur Yazısı Gösterilsin mi?', type: 'boolean' },
  kapakDetaylari: { label: 'Kapak Detayları', type: 'array' },
  alimTuru: { label: 'Alım Türü', type: 'string' },
  yukleniciFirma: { label: 'Yüklenici Firma', type: 'object' },
  yukleniciAdresi: { label: 'Yüklenici Adresi', type: 'string' },
  yukleniciIlce: { label: 'Yüklenici İl/İlçe', type: 'string' },
  firmaAdi: { label: 'Firma Adı', type: 'string' },
  toplamTutar: { label: 'Toplam Tutar', type: 'string' }
}
