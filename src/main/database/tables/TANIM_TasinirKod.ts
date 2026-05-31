export const TANIM_TasinirKod = {
  name: 'TANIM_TasinirKod',
  description: 'Taşınır Kod listesi hiyerarşisi (150.01 vb.)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'hesap_kodu', type: 'TEXT', notNull: true },
    { name: 'duzey_1', type: 'TEXT' },
    { name: 'duzey_2', type: 'TEXT' },
    { name: 'duzey_3', type: 'TEXT' },
    { name: 'duzey_4', type: 'TEXT' },
    { name: 'duzey_5', type: 'TEXT' },
    { name: 'tam_kod', type: 'TEXT', unique: true, notNull: true },
    { name: 'aciklama', type: 'TEXT', notNull: true },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
