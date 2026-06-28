export const TANIM_TasinirKod = {
  name: 'TANIM_TasinirKod',
  description: 'Taşınır Kod listesi hiyerarşisi (150.01 vb.)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'hesap_kodu', type: 'TEXT', notNull: true, description: 'Hesap Kodu' },
    { name: 'duzey_1', type: 'TEXT', description: 'Duzey 1' },
    { name: 'duzey_2', type: 'TEXT', description: 'Duzey 2' },
    { name: 'duzey_3', type: 'TEXT', description: 'Duzey 3' },
    { name: 'duzey_4', type: 'TEXT', description: 'Duzey 4' },
    { name: 'duzey_5', type: 'TEXT', description: 'Duzey 5' },
    { name: 'tam_kod', type: 'TEXT', unique: true, notNull: true, description: 'Tam Kod' },
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
