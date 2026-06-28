export const TANIM_Roller = {
  name: 'TANIM_Roller',
  description:
    'Belgelerde ve süreçlerde kullanılacak dinamik rol tanımları (örn: Harcama Yetkilisi)',
  columns: [
    {
      name: 'id',
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
      description: 'Sıra / ID'
    },
    {
      name: 'rol_adi',
      type: 'TEXT',
      notNull: true,
      description: 'Rol Adı (Örn: Harcama Yetkilisi)'
    },
    {
      name: 'rol_kodu',
      type: 'TEXT',
      notNull: true,
      unique: true,
      description: 'Rol Kodu (Örn: harcama_yetkilisi)'
    },
    {
      name: 'varsayilan_personel_id',
      type: 'INTEGER',
      description: 'Varsayılan Personel ID (TANIM_Personel.id)'
    },
    { name: 'aciklama', type: 'TEXT', description: 'Rol Hakkında Açıklama' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Oluşturulma Tarihi'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Güncellenme Tarihi'
    }
  ],
  initialData: [
    {
      rol_adi: 'Harcama Yetkilisi',
      rol_kodu: 'harcama_yetkilisi',
      aciklama: 'Doğrudan Temin harcamasını onaylayan yetkili'
    },
    {
      rol_adi: 'İhale Yetkilisi',
      rol_kodu: 'ihale_yetkilisi',
      aciklama: 'İhale/Temin işlerini yürüten ve onaylayan yetkili'
    },
    {
      rol_adi: 'Hazırlayan Personel',
      rol_kodu: 'hazirlayan',
      aciklama: 'Belgeleri hazırlayan personel'
    },
    {
      rol_adi: 'Talep Eden Personel',
      rol_kodu: 'talep_eden',
      aciklama: 'İhtiyacı talep eden personel'
    },
    {
      rol_adi: 'Onaylayan Personel',
      rol_kodu: 'onaylayan',
      aciklama: 'Belgeleri onaylayan personel (Makam vb.)'
    },
    {
      rol_adi: 'İlgili Personel',
      rol_kodu: 'ilgili_personel',
      aciklama: 'Süreçle ilgili diğer görevli personel'
    }
  ]
}
