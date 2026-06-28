export const TANIM_Placeholder = {
  name: 'TANIM_Placeholder',
  description: 'Sistem genelinde kullanılabilen dinamik alanların tanımı',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'anahtar', type: 'TEXT', notNull: true, unique: true, description: 'Anahtar' },
    { name: 'etiket', type: 'TEXT', notNull: true, description: 'Etiket' },
    { name: 'kaynak_tablo', type: 'TEXT', description: 'Kaynak Tablo' },
    { name: 'kaynak_sutun', type: 'TEXT', description: 'Kaynak Sutun' },
    { name: 'varsayilan', type: 'TEXT', description: 'Varsayilan' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', description: 'Created At' }
  ],
  initialData: [
    { anahtar: 'firma_adi', etiket: 'İstekli Firma Adı', kaynak_tablo: 'TANIM_Firma', kaynak_sutun: 'unvan', varsayilan: 'Firma A.Ş.', aciklama: 'Temin edilecek firmanın ticari ünvanı' },
    { anahtar: 'firma_vkn', etiket: 'Vergi No / TCKN', kaynak_tablo: 'TANIM_Firma', kaynak_sutun: 'vergi_no', aciklama: 'Firmanın vergi numarası' },
    { anahtar: 'tarih', etiket: 'Tarih', varsayilan: '01.01.2024', aciklama: 'Belgenin oluşturulduğu tarih' },
    { anahtar: 'dosyaTarihi', etiket: 'Dosya Tarihi', varsayilan: '01.01.2024' },
    { anahtar: 'kurumIci', etiket: 'Kurum İçi Mi', varsayilan: 'false' },
    { anahtar: 'evrakSayisi', etiket: 'Evrak Sayısı', varsayilan: 'E-12345' },
    { anahtar: 'sunulacakMakamAdi', etiket: 'Sunulacak Makam', varsayilan: 'MAKAM ONAYINA' },
    { anahtar: 'dosyaKonusu', etiket: 'Dosya Konusu', varsayilan: 'Alım İşi' },
    { anahtar: 'hazirlayanPersonelAdi', etiket: 'Hazırlayan Personel', varsayilan: 'Ahmet Yılmaz' },
    { anahtar: 'hazirlayanPersonelUnvan', etiket: 'Hazırlayan Unvan', varsayilan: 'Memur' },
    { anahtar: 'onaylayanPersonelAdi', etiket: 'Onaylayan Personel', varsayilan: 'Ayşe Kaya' },
    { anahtar: 'onaylayanPersonelUnvan', etiket: 'Onaylayan Unvan', varsayilan: 'Müdür' },
    { anahtar: 'ilgiliPersonelAdi', etiket: 'İlgili Personel', varsayilan: 'Veli Demir' },
    { anahtar: 'kurumumuz', etiket: 'Kurumumuz Soneki', varsayilan: 'Kurumumuz' },
    { anahtar: 'kurumunuz', etiket: 'Kurumunuz Soneki', varsayilan: 'Kurumunuz' },
    { anahtar: 'kurumu', etiket: 'Kurumu Soneki', varsayilan: 'Kurumu' },
    { anahtar: 'kurumlari', etiket: 'Kurumları Soneki', varsayilan: 'Kurumları' },
    { anahtar: 'kalemSayisi', etiket: 'Kalem Sayısı', varsayilan: '2' },
    { anahtar: 'kalemSayisiYazi', etiket: 'Kalem Sayısı (Yazı)', varsayilan: 'İki' },
    { anahtar: 'toplam_tutar', etiket: 'Toplam Tutar', kaynak_tablo: 'DATA_TeminDosyasi', kaynak_sutun: 'yaklasik_maliyet', aciklama: 'Dosyanın toplam tutarı' }
  ]
}
