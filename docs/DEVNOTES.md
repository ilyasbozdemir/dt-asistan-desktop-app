# 📍 Geliştirme Notu — Checkpoint

---

## 🔖 Neredeyiz?

### ✅ Tamamlananlar

- `DATA_TeminDosyasi` şemasına `tekrar_no` kolonu eklendi
- Aynı isimde dosya kaydedilince otomatik `#2`, `#3` eki — `yeni.screen.tsx`
- İşin Adı alanında Türkçe destekli autocomplete + duplicate uyarısı
- `db:run` IPC handler'da `workspaceManager.save()` tetikleniyor (dosya .dtal'ye yazılıyor)
- Schema Self-Healing: `ALTER TABLE ADD COLUMN` ile UNIQUE/NOT NULL ekleme hatası düzeltildi
- `index.screen.tsx` (dosyalar listesi) tamamen yenilendi
- "Kurum İçi Temin Numarası" → "Doğrudan Temin Numarası" düzeltildi
- **Şablon Tasarımları & İmzalar**: `odeme-yazisi` ve `odeme-emri-belgesi` şablonları standart antet ve logolu yapıya kavuşturuldu. `odeme-emri-belgesi` imza panelleri dinamik değişkenlere bağlandı (antet alan darlığı nedeniyle kaldırıldı).
- **Hakediş Raporu Şablonu**: `hakedis-raporu` için girdiler şablon değişkenleriyle değiştirilerek yeni şablon oluşturuldu, antet ve imza düzenleri standartlaştırıldı.
- **Test Verisi Çeşitliliği**: Şablon test verilerinde (mock JSON) Antalya/Kaş, Ankara/Çankaya ve İzmir/Seferihisar gibi farklı belediyeler ve firmalar kullanılarak zenginlik sağlandı.
- **Tag & Release**: `v1.0.0-alpha.78` ve `v1.0.0-alpha.79` sürümleri paketlenip GitHub üzerinde yeni release olarak yayınlandı.
- **JSON Şeması Desteği (Alpha)**: Geleneksel Mustache şablonları yerine dinamik sayfa ayarlarını ve gövde bloklarını destekleyen yeni veri tabanlı mimari için alpha düzeyinde çalışmalar başlatıldı (`ISSUE_JSON_schema_support.md` oluşturuldu).

---

## 🚧 Devam Edecek: Aktif Dosya İşlemleri Mimarisi

**Problem:** Sidebar'daki "Aktif Dosya İşlemleri" altındaki tüm alt ekranlar şu
an placeholder (Yakında).

**Plan:** Her SubScreen ekranı aktif `DATA_TeminDosyasi` kaydına bağlı verilerle
çalışacak.

### Önerilen Yeni Tablolar

```
DATA_TeminKalem     → Dosyaya bağlı malzeme kalemleri (YM cetveli)
DATA_TeminFirma     → Dosyaya bağlı istekli firmalar + teklifler
DATA_TeminKomisyon  → Komisyon üyeleri
DATA_TeminBelge     → Üretilen belge kayıtları (log)
```

### Açık Sorular (kullanıcıyla konuşulacak)

1. Malzeme: `TANIM_Kalem` havuzundan seçim mi, serbest giriş mi?
2. Şablonlar: Hardcoded HTML mi, DB'den çekilen kullanıcı şablonu mu?
3. Çıktı: DOCX mı, PDF mi, ikisi de mi?

---

## 📁 Kritik Dosyalar

| Dosya                                                  | Açıklama                          |
| ------------------------------------------------------ | --------------------------------- |
| `src/main/database/tables/DATA_TeminDosyasi.ts`        | Ana DT dosyası şeması             |
| `src/main/database/workspace.ts`                       | Workspace yönetimi + Self-healing |
| `src/renderer/src/screens/dosyalar/index.screen.tsx`   | DT dosyaları listesi              |
| `src/renderer/src/screens/dosyalar/yeni.screen.tsx`    | Yeni/Düzenle formu                |
| `src/renderer/src/screens/dosya/SubScreens.screen.tsx` | Alt ekranlar (tümü placeholder)   |
| `src/renderer/src/components/layout/Sidebar.tsx`       | Dinamik sidebar menüsü            |
| `src/renderer/src/components/layout/TeminSelector.tsx` | Aktif dosya seçici                |
