export const TANIM_Birim = {
  name: 'TANIM_Birim',
  description: 'Kurum içerisindeki müdürlükler, birimler ve departmanlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true, description: 'Sıra / ID' },
    { name: 'ad', type: 'TEXT', notNull: true, description: 'Birim Adı' },
    { name: 'kisa_ad', type: 'TEXT', description: 'Kısa Adı (Kısaltma)' },
    { name: 'harcama_yetkilisi_id', type: 'INTEGER', description: 'Harcama Yetkilisi (Personel ID)' },
    { name: 'harcama_yetkilisi_unvan', type: 'TEXT', description: 'Harcama Yetkilisi Unvanı' },
    { name: 'gerceklestirme_gorevlisi_id', type: 'INTEGER', description: 'Gerçekleştirme Görevlisi (Personel ID)' },
    { name: 'gerceklestirme_gorevlisi_unvan', type: 'TEXT', description: 'Gerçekleştirme Görevlisi Unvanı' },
    { name: 'aktif_mi', type: 'INTEGER', default: 1, description: 'Aktif Birim mi?' },
    { name: 'say2000i', type: 'TEXT', description: 'Say2000i Kodu' },
    { name: 'dtvt_kodu', type: 'TEXT', description: 'DTVT Kodu' },
    { name: 'detsis_kodu', type: 'TEXT', description: 'DETSİS Kodu' },
    { name: 'muhasebe_kodu', type: 'TEXT', description: 'Muhasebe Kodu' },
    { name: 'muhasebe_adi', type: 'TEXT', description: 'Muhasebe Adı' },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'birim_adi', type: 'TEXT', notNull: true, unique: true, description: 'Birim Adi' },
    { name: 'antet_ek_satir', type: 'TEXT', description: 'Antet Ek Satir' },
    { name: 'ihtiyac_yeri_eki', type: 'TEXT', description: 'Ihtiyac Yeri Eki' },
    { name: 'sunum_makami', type: 'TEXT', description: 'Sunum Makami' },
    { name: 'e_butce', type: 'TEXT', description: 'E Butce' },
    { name: 'harcama_kodu', type: 'TEXT', description: 'Harcama Kodu' },
    { name: 'harcama_adi', type: 'TEXT', description: 'Harcama Adi' },
    { name: 'ayrintili_bilgi_personel', type: 'TEXT', description: 'Ayrintili Bilgi Personel' },
    { name: 'ilgili_personel_id', type: 'INTEGER', description: 'Ilgili Personel ID' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', description: 'Created At' }
  ],
  initialData: [
    {
      birim_adi: 'Fen İşleri Müdürlüğü',
      antet_ek_satir: 'FEN İŞLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'FEN İŞLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Mali Hizmetler Müdürlüğü',
      antet_ek_satir: 'MALİ HİZMETLER MÜDÜRLÜĞÜ',
      sunum_makami: 'MALİ HİZMETLER MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Yazı İşleri Müdürlüğü',
      antet_ek_satir: 'YAZI İŞLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'YAZI İŞLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Zabıta Amirliği',
      antet_ek_satir: 'ZABITA AMİRLİĞİ',
      sunum_makami: 'ZABITA AMİRLİĞİNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Destek Hizmetleri Müdürlüğü',
      antet_ek_satir: 'DESTEK HİZMETLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'DESTEK HİZMETLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    }
  ]
}
