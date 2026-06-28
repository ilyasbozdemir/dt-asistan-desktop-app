export const TANIM_KodSozlugu = {
  name: 'TANIM_KodSozlugu',
  description:
    'Mali ve Kurumsal Bütçe Kodları Sözlüğü (Kurumsal Kod, Fonksiyonel Kod, Muhasebe Birimi, vb.)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'tur', type: 'TEXT', notNull: true, description: 'Tur' }, // 'kurumsal', 'fonksiyonel', 'muhasebe_birimi', 'harcama_birimi'
    { name: 'kod', type: 'TEXT', notNull: true, description: 'Kod' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  constraints: ['UNIQUE(tur, kod)'],
  initialData: [
    // Varsayılan Kurumsal Kodlar
    { tur: 'kurumsal', kod: '46.00.00.01', aciklama: 'Mali Hizmetler Müdürlüğü', aktif_mi: 1 },
    { tur: 'kurumsal', kod: '30.11.01.23', aciklama: 'Destek Hizmetleri Müdürlüğü', aktif_mi: 1 },

    // Varsayılan Fonksiyonel Kodlar
    {
      tur: 'fonksiyonel',
      kod: '01.1.2.00',
      aciklama: 'Finansal ve Mali İşler Hizmetleri',
      aktif_mi: 1
    },
    { tur: 'fonksiyonel', kod: '01.3.1.00', aciklama: 'Genel Personel Hizmetleri', aktif_mi: 1 },
    {
      tur: 'fonksiyonel',
      kod: '01.3.2.00',
      aciklama: 'Genel Planlama ve İstatistik Hizmetleri',
      aktif_mi: 1
    },
    { tur: 'fonksiyonel', kod: '01.3.9.00', aciklama: 'Diğer Genel Hizmetler', aktif_mi: 1 },

    // Varsayılan Muhasebe Birimleri
    {
      tur: 'muhasebe_birimi',
      kod: '10010',
      aciklama: 'Belediye Merkez Muhasebe Birimi',
      aktif_mi: 1
    },

    // Varsayılan Harcama Birimleri
    { tur: 'harcama_birimi', kod: '01', aciklama: 'Başkanlık', aktif_mi: 1 },
    { tur: 'harcama_birimi', kod: '22', aciklama: 'Mali Hizmetler Müdürlüğü', aktif_mi: 1 },
    { tur: 'harcama_birimi', kod: '23', aciklama: 'Destek Hizmetleri Müdürlüğü', aktif_mi: 1 }
  ]
}
