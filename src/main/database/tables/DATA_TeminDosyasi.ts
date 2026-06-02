export const DATA_TeminDosyasi = {
  name: 'DATA_TeminDosyasi',
  description: 'Doğrudan temin dosyalarının ana kayıtları',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'temin_no', type: 'TEXT' }, // Kurum içi numara (Örn: 2026/DT-001)
    { name: 'dosya_acilis_tarihi', type: 'DATE' },
    { name: 'butce_yili', type: 'INTEGER' },
    { name: 'butce_tipi', type: 'TEXT' }, // Tümü | Genel Bütçe | Döner Sermaye | Diğer
    { name: 'konu', type: 'TEXT', notNull: true }, // Temin konusu (İşin Adı)
    { name: 'isin_aciklamasi', type: 'TEXT' },
    { name: 'birim_id', type: 'INTEGER' }, // İhalesi yapılacak birim (TANIM_Birim)
    
    // Antet / İdari Alanlar
    { name: 'antet_ek_satir', type: 'TEXT' },
    { name: 'sunulacak_makam', type: 'TEXT' },
    { name: 'ihtiyac_yeri', type: 'TEXT' },
    
    // Mali Kodlar
    { name: 'kurumsal_kod', type: 'TEXT' },
    { name: 'fonksiyonel_kod', type: 'TEXT' },
    { name: 'muhasebe_birimi', type: 'TEXT' },
    { name: 'harcama_birimi', type: 'TEXT' },
    { name: 'finansman_kodu', type: 'TEXT' },
    { name: 'ekonomik_kod', type: 'TEXT' },
    
    // Talep
    { name: 'talep_tarihi', type: 'DATE' },
    { name: 'talep_sayisi', type: 'TEXT' },
    
    // İhale / Alım Türü
    { name: 'ihale_tipi', type: 'TEXT', default: "'Doğrudan Temin'" },
    { name: 'tur', type: 'TEXT', notNull: true, default: "'mal'" }, // Alım Türü: mal | hizmet | yapim_isi | danismanlik
    { name: 'ihale_sekli', type: 'TEXT' }, // 22/d*, 22/a vb.
    
    // Teklif ve Sözleşme
    { name: 'teklif_sozlesme_turu', type: 'TEXT' }, // Birim Fiyat | Götürü Bedel
    { name: 'alt_yuklenici_olacak_mi', type: 'INTEGER', default: 0 },
    { name: 'kismi_teklif_verilecek_mi', type: 'INTEGER', default: 0 },
    { name: 'fiyat_farki_dayanagi', type: 'TEXT' },
    { name: 'yatirim_proje_no', type: 'TEXT' },
    { name: 'avans_verilecek_mi', type: 'INTEGER', default: 0 },
    
    // Hesaplama ve Maliyet
    { name: 'yaklasik_maliyet_hesaplamasi', type: 'TEXT' },
    { name: 'kdv', type: 'TEXT' },
    { name: 'hesaplama_esasi', type: 'TEXT' },
    { name: 'komisyon_takdiri', type: 'TEXT' },
    { name: 'tibbi_cihaz_alimi_mi', type: 'INTEGER', default: 0 },
    
    // Süreç / Tarihler / Kişiler
    { name: 'irtibat_yetkilisi_id', type: 'INTEGER' }, // Personel referans
    { name: 'son_teklif_verme_tarihi', type: 'DATETIME' },
    { name: 'teslim_tarihi', type: 'DATE' }, // Tahmini bitiş tarihi
    
    { name: 'yaklasik_maliyet', type: 'REAL', default: 0 },
    { name: 'butce_kodu', type: 'TEXT' },
    { name: 'temin_tarihi', type: 'DATE' },
    { name: 'firma_id', type: 'INTEGER' }, // Seçilen kazanan firma
    { name: 'onay_personel_id', type: 'INTEGER' }, // Onay veren / harcama yetkilisi
    { name: 'hazirlayan_personel_id', type: 'INTEGER' },
    { name: 'durum_asama_id', type: 'INTEGER' }, // TANIM_Asama referansı
    { name: 'mevzuat_id', type: 'INTEGER' }, // TANIM_Mevzuat kaydına referans
    { name: 'notlar', type: 'TEXT' },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: []
}
