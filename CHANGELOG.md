# Değişiklik Günlüğü (Changelog)

Bu dosyada Doğrudan Temin (DT) Masaüstü Uygulaması'nın her sürümünde yapılan önemli değişiklikler listelenmektedir.

## [Unreleased]

### Eklenenler (Added)

- `SubScreens.screen.tsx` dosyası daha iyi bir kod organizasyonu için ayrı parçalara/bileşenlere bölündü (17 ayrı ekrana ayrıştırıldı).
- İhtiyaç Listesi yazdırma işlemi ana liste ekranı içerisine (PDF olarak kaydet/yazdır butonu ile) entegre edildi.
- Sidebar ve menü yönlendirmelerinde "Malzeme Listesi" terimi "İhtiyaç Listesi" olarak güncellendi.
- Eksik olan `CONTRIBUTING.md` ve `CHANGELOG.md` dosyaları eklendi.
- Dağınık duran dokümantasyon dosyaları (`.md` uzantılı dosyalar) `docs/` klasörü altına taşınarak düzen sağlandı.

### Düzeltilenler (Fixed)

- Çeşitli lint ve tip uyarıları giderildi.

### Kaldırılanlar (Removed)

- Kullanılmayan `IhtiyacListesiTalepFormu` rotası ve `IhtiyacListesi.screen.tsx` tamamen silindi.
