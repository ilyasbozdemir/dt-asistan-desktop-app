export const TANIM_Personel = {
  name: 'TANIM_Personel',
  description: 'Temin süreçlerinde görev alan kurum personel havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT' },
    { name: 'ad_soyad', type: 'TEXT', notNull: true },
    { name: 'unvan', type: 'TEXT' },
    { name: 'birim', type: 'TEXT' },
    { name: 'sicil_no', type: 'TEXT' },
    { name: 'telefon', type: 'TEXT' },
    { name: 'eposta', type: 'TEXT' },
    // İmza yetkileri (0 = hayır, 1 = evet)
    { name: 'ihale_yetkilisi_mi', type: 'INTEGER', notNull: true, default: 0 },
    { name: 'harcama_yetkilisi_mi', type: 'INTEGER', notNull: true, default: 0 },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'notlar', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
