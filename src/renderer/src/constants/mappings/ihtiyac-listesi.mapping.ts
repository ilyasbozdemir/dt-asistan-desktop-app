import { ProcessMapping } from './types'

export const IhtiyacListesiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'İhtiyaç Listesi'
  },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi olarak otomatik üretilir'
  },

  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
  },

  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      kodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar'
    },
    aciklama: 'İhtiyaç listesi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'İhtiyaç listesi yerleri'
  }
  
}
