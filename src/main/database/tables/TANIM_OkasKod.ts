export const TANIM_OkasKod = {
  name: 'TANIM_OkasKod',
  description: 'OKAS (Ortak Kamu Alımları Sözlüğü) 8 haneli kamu alım kodları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'kod', type: 'TEXT', unique: true, notNull: true, description: 'Kod' }, // 8 haneli OKAS kodu, örn: 30192700
    { name: 'bolum', type: 'TEXT', description: 'Bolum' }, // İlk 2 hane: Bölüm
    { name: 'grup', type: 'TEXT', description: 'Grup' }, // İlk 3 hane: Grup
    { name: 'sinif', type: 'TEXT', description: 'Sinif' }, // İlk 4 hane: Sınıf
    { name: 'aciklama', type: 'TEXT', notNull: true, description: 'Aciklama' },
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
  initialData: []
}
