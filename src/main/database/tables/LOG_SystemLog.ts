export const LOG_SystemLog = {
  name: 'LOG_SystemLog',
  description: 'Sistem üzerindeki işlem loglarını ve otomatik bildirimleri tutar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'title', type: 'TEXT', notNull: true, description: 'Title' },
    { name: 'message', type: 'TEXT', notNull: true, description: 'Message' },
    { name: 'type', type: 'TEXT', notNull: true, default: "'info'", description: 'Type' }, // 'info', 'success', 'warning', 'error'
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    }
  ],
  initialData: []
}
