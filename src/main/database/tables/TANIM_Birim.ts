export const TANIM_Birim = {
  name: 'TANIM_Birim',
  description: 'Kurum içerisindeki müdürlükler, birimler ve departmanlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'birim_adi', type: 'TEXT', notNull: true, unique: true },
    { name: 'antet_ek_satir', type: 'TEXT' },
    { name: 'ihtiyac_yeri_eki', type: 'TEXT' },
    { name: 'sunum_makami', type: 'TEXT' },
    { name: 'e_butce', type: 'TEXT' },
    { name: 'say2000i', type: 'TEXT' },
    { name: 'dtvt_kodu', type: 'TEXT' },
    { name: 'ayrintili_bilgi_personel', type: 'TEXT' },
    { name: 'ilgili_personel_id', type: 'INTEGER' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: [
    { birim_adi: 'Fen İşleri Müdürlüğü' },
    { birim_adi: 'Mali Hizmetler Müdürlüğü' },
    { birim_adi: 'Yazı İşleri Müdürlüğü' },
    { birim_adi: 'Zabıta Amirliği' }
  ]
}
