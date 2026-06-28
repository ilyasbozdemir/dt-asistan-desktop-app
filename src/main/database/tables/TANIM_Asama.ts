export const TANIM_Asama = {
  name: 'TANIM_Asama',
  description: 'Süreçteki işlem aşamaları (Status)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'asama_sira', type: 'INTEGER', notNull: true, description: 'Asama Sira' },
    { name: 'asama_adi', type: 'TEXT', notNull: true, description: 'Asama Adi' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    { name: 'rozet_rengi', type: 'TEXT', default: "'blue'", description: 'Rozet Rengi' },
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
  constraints: ['UNIQUE(asama_adi)'],
  initialData: [
    {
      asama_sira: 1,
      asama_adi: 'İhtiyaç Tespiti & Başlangıç',
      aciklama:
        'İlgili birim tarafından ihtiyacın belirlendiği ve harcama talimatının hazırlandığı ilk aşamadır.',
      rozet_rengi: 'amber'
    },
    {
      asama_sira: 2,
      asama_adi: 'Piyasa Fiyat Araştırması',
      aciklama:
        'Firmalardan tekliflerin toplandığı, yaklaşık maliyetin belirlendiği ve alım yapılacak firmanın seçildiği aşamadır.',
      rozet_rengi: 'blue'
    },
    {
      asama_sira: 3,
      asama_adi: 'Sipariş & Sözleşme',
      aciklama:
        'Harcama yetkilisinden nihai onayın alındığı ve firmaya siparişin geçildiği (gerekiyorsa sözleşmenin imzalandığı) aşamadır.',
      rozet_rengi: 'purple'
    },
    {
      asama_sira: 4,
      asama_adi: 'Kabul & Ödeme İşlemleri',
      aciklama:
        'Mal veya hizmetin teslim alındığı, kabul komisyonunca onaylandığı ve ödeme evraklarının (ÖEB) Mali Hizmetlere sevk edildiği son aşamadır.',
      rozet_rengi: 'emerald'
    }
  ]
}
