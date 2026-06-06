export const TANIM_KomisyonGorevi = {
  name: 'TANIM_KomisyonGorevi',
  description: 'Komisyon görev/unvan tanımları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'ad', type: 'TEXT', notNull: true },
    { name: 'aciklama', type: 'TEXT' },
    { name: 'aktif_mi', type: 'BOOLEAN', notNull: true, default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    'UNIQUE(ad)'
  ],
  initialData: [
    { ad: 'Başkan', aciklama: 'Komisyona başkanlık eden asil üye.', aktif_mi: 1 },
    { ad: 'Üye', aciklama: 'Komisyonda görevli asil üye.', aktif_mi: 1 },
    { ad: 'Düz Üye', aciklama: 'Komisyonda görevli standart üye.', aktif_mi: 1 },
    { ad: 'Uzman Üye', aciklama: 'Mali veya teknik konularda uzmanlığı olan üye.', aktif_mi: 1 },
    { ad: 'Yedek Üye', aciklama: 'Asil üyelerin katılamadığı durumlarda görev alan üye.', aktif_mi: 1 },
    { ad: 'Harcama Yetkilisi', aciklama: 'Harcama yetkilisi görevini yürüten personel.', aktif_mi: 1 },
    { ad: 'Satın Alma Harcama Yetkilisi', aciklama: 'Satın alma süreçlerinden sorumlu harcama yetkilisi.', aktif_mi: 1 },
    { ad: 'Gerçekleştirme Görevlisi', aciklama: 'İşin gerçekleştirilmesinden sorumlu görevli.', aktif_mi: 1 },
    { ad: 'Muhasebe Yetkilisi', aciklama: 'Ödeme ve muhasebe işlemlerinden sorumlu yetkili.', aktif_mi: 1 },
    { ad: 'Fiyat Araştırma Görevlisi', aciklama: 'Piyasa fiyat araştırmasını yürüten görevli.', aktif_mi: 1 }
  ]
}
