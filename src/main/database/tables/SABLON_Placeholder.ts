export const SABLON_Placeholder = {
  name: 'SABLON_Placeholder',
  description: 'Hangi şablonda hangi placeholder kullanılıyor',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'sablon_id', type: 'INTEGER', notNull: true, description: 'Sablon ID' },
    { name: 'placeholder_id', type: 'INTEGER', notNull: true, description: 'Placeholder ID' },
    { name: 'zorunlu_mu', type: 'INTEGER', default: 1, description: 'Zorunlu Mu' }
  ],
  constraints: [
    'FOREIGN KEY(sablon_id) REFERENCES TANIM_Sablon(id) ON DELETE CASCADE',
    'FOREIGN KEY(placeholder_id) REFERENCES TANIM_Placeholder(id) ON DELETE CASCADE',
    'UNIQUE(sablon_id, placeholder_id)'
  ],
  initialData: []
}
