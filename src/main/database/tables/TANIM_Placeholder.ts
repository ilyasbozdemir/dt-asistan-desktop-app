// @ts-ignore - Projeler arası (main -> renderer) import uyarısını yoksay
import { TemplateVariablesSchema } from '../../../renderer/src/constants/templateVariables'

export const TANIM_Placeholder = {
  name: 'TANIM_Placeholder',
  description: 'Sistem genelinde kullanılabilen dinamik alanların tanımı',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'anahtar', type: 'TEXT', notNull: true, unique: true, description: 'Anahtar' },
    { name: 'etiket', type: 'TEXT', notNull: true, description: 'Etiket' },
    {
      name: 'veri_tipi',
      type: 'TEXT',
      default: 'string',
      description: 'Veri Tipi (string, number, boolean, date, array, object)'
    },
    { name: 'kaynak_tablo', type: 'TEXT', description: 'Kaynak Tablo' },
    { name: 'kaynak_sutun', type: 'TEXT', description: 'Kaynak Sutun' },
    { name: 'varsayilan', type: 'TEXT', description: 'Varsayilan' },
    { name: 'aciklama', type: 'TEXT', description: 'Aciklama' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    }
  ],
  initialData: Object.entries(TemplateVariablesSchema).map(([anahtar, def]) => ({
    anahtar,
    etiket: def.label,
    veri_tipi: def.type,
    ...(def.kaynak_tablo ? { kaynak_tablo: def.kaynak_tablo } : {}),
    ...(def.kaynak_sutun ? { kaynak_sutun: def.kaynak_sutun } : {}),
    ...(def.varsayilan ? { varsayilan: def.varsayilan } : {}),
    ...(def.description ? { aciklama: def.description } : {})
  }))
}
