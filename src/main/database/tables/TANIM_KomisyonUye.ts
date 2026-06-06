export const TANIM_KomisyonUye = {
  name: 'TANIM_KomisyonUye',
  description: 'Oluşturulan komisyondaki personeller ve görevleri',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'komisyon_id', type: 'INTEGER', notNull: true }, // TANIM_Komisyon
    { name: 'personel_id', type: 'INTEGER' }, // TANIM_Personel (Boş olabilir, rol açılıp sonra atanabilir)
    { name: 'gorev_id', type: 'INTEGER', notNull: true }, // TANIM_KomisyonGorevi (Örn: Başkan, Üye)
    { name: 'asil_mi', type: 'BOOLEAN', default: 1 }, // Asil Üye mi Yedek Üye mi?
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  constraints: [
    'FOREIGN KEY(komisyon_id) REFERENCES TANIM_Komisyon(id) ON DELETE CASCADE',
    'FOREIGN KEY(personel_id) REFERENCES TANIM_Personel(id) ON DELETE CASCADE',
    'FOREIGN KEY(gorev_id) REFERENCES TANIM_KomisyonGorevi(id) ON DELETE CASCADE'
  ],
  initialData: []
}
