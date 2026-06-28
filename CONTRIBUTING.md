# Katkıda Bulunma Rehberi (Contributing)

Öncelikle Doğrudan Temin (DT) Masaüstü Uygulaması projesine katkıda bulunmayı düşündüğünüz için teşekkür ederiz!

## Geliştirme Ortamının Kurulumu

1. Repoyu bilgisayarınıza klonlayın.
2. Gerekli bağımlılıkları yüklemek için `pnpm install` komutunu çalıştırın.
3. Uygulamayı geliştirme modunda başlatmak için `pnpm dev` komutunu kullanın.

## Kod Standartları

- Proje genelinde **TypeScript**, **React** ve **Tailwind CSS** kullanılmaktadır.
- Electron altyapısında `electron-vite` şablonu temel alınmıştır.
- Veritabanı olarak **SQLite** kullanılmaktadır.
- Yeni kod eklerken mevcut kodlama stiline ve lint kurallarına dikkat ediniz.

## Katkı Süreci

1. Yeni bir branch (dal) oluşturun: `git checkout -b ozellik/yeni-ozellik-adi`
2. Değişikliklerinizi yapın ve commit'leyin: `git commit -am 'feat: yeni özellik eklendi'`
3. Dalınızı uzak sunucuya gönderin: `git push origin ozellik/yeni-ozellik-adi`
4. Bir **Pull Request (PR)** açarak değişikliklerinizi incelemeye sunun.

## Sorun Bildirimi

Eğer uygulamada bir hata fark ederseniz veya yeni bir özellik önermek isterseniz, lütfen Issue açarak durumu detaylı bir şekilde açıklayın.
