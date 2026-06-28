# Analitik Bütçe Sınıflandırması (ABS) ve Kod Mimarisi

DT (Doğrudan Temin) Asistanı uygulamasında, evraklara (Onay Belgesi, Ödeme Emri Belgesi vb.) yansıtılan "Bütçe Kodu", Kamu Mali Yönetimi ve Kontrol Kanunu (5018 sayılı kanun) kapsamında uygulanan Analitik Bütçe Sınıflandırması (ABS) standartlarına dayanmaktadır.

Bütçe Kodu, temel olarak 4 ana bileşenin bir araya gelmesiyle oluşur:

## 1. Kurumsal Kod (Kurum ve Birim Bilgisi)

Harcamayı yapan idari birimi gösterir. 4 düzeyden oluşur (Örn: `30.11.01.22`).

- **Düzey 1:** Kurum Tipi (Örn: 30 - Mahalli İdareler)
- **Düzey 2:** İl/Bölge (Örn: 11 - Bilecik)
- **Düzey 3:** İlçe/Kurum (Örn: 01 - Merkez)
- **Düzey 4:** Harcama Birimi / Müdürlük (Örn: 22 - Mali Hizmetler Müdürlüğü)
  _Sistemde `Ayarlar > Kurum Bilgileri` alanından seçilerek yönetilir._

## 2. Fonksiyonel Kod (Hizmetin Amacı)

Harcamanın hangi devlet fonksiyonunu (eğitim, sağlık, genel yönetim vb.) yerine getirmek için yapıldığını gösterir. 4 düzeyden oluşur (Örn: `01.1.2.00`).

- **Düzey 1:** Ana Fonksiyon (Örn: 01 - Genel Kamu Hizmetleri)
- **Düzey 2:** Alt Fonksiyon
- **Düzey 3 ve 4:** Detay Fonksiyonlar
  _Sistemde `Ayarlar > Kurum Bilgileri` alanından seçilerek yönetilir._

## 3. Finansman Kodu (Kaynağın Türü)

Harcamanın hangi finansman kaynağından karşılandığını gösterir. Tek düzeydir (Örn: `5`).

- **1:** Genel Bütçeli İdareler
- **2:** Özel Bütçeli İdareler
- **5:** Mahalli İdareler
  _Sistemde Kurum Tipi'ne bağlı olarak `Ayarlar` menüsünden otomatik belirlenir/seçilir._

## 4. Ekonomik Kod (Harcamanın Türü)

Harcamanın ekonomik mahiyetini (ne satın alındığını) gösterir. 4 düzeyden oluşur (Örn: `03.2.1.01`).

- **03:** Mal ve Hizmet Alım Giderleri
- **2:** Tüketime Yönelik Mal ve Malzeme Alımları
- **1:** Kırtasiye ve Büro Malzemesi Alımları
- **01:** Kırtasiye Alımları
  _Sistemde `Mevzuat ve Parametreler` kısmındaki sözlükten yönetilir ve ihale/alım sürecinde dosyaya eklenen kalemlere göre belirlenir._

## 5. Mal Alımlarında Taşınır ve Muhasebe Hesap Kodları (İstisnai Durum)

Mal alımlarında, bütçeden çıkan parayı göstermek için yukarıdaki **4 düzeyli Ekonomik Kod (03.2.1.01 vb.)** kullanılırken; alınan malın ambar/depo kaydı (TİF - Taşınır İşlem Fişi) ve bilançoya işlenmesi için **Muhasebe Hesap Kodu (Taşınır Kodu)** devreye girer.

- Taşınır/Muhasebe kodları genellikle **5 düzeye** kadar iner (Örn: `150.01.01.01.01`).
- **Düzey 1 (Hesap):** 150 - İlk Madde ve Malzemeler
- **Düzey 2 (1. Derece Detay):** 01 - Kırtasiye Malzemeleri
- **Düzey 3 (2. Derece Detay):** 01 - Yazı Araçları
- **Düzey 4 ve 5:** Kalemin daha spesifik cinsi ve çeşidi.
  _Mal alım dosyalarında, her malzeme kalemi için Bütçe Ekonomik Kodu ile Taşınır/Muhasebe Kodu birbirine entegre (eşleştirilmiş) olarak çalışır._

---

## Bütçe Kodunun Birleştirilmesi

Uygulama, evrak (ÖEB, Onay Belgesi) üretirken yukarıdaki 4 bileşeni yan yana getirerek tam bütçe kodunu oluşturur:

**[Kurumsal Kod] - [Fonksiyonel Kod] - [Finansman Kodu] - [Ekonomik Kod]**

**Örnek Tam Bütçe Tertibi:**
`30.11.01.22 - 01.1.2.00 - 5 - 03.2.1.01`
_(Bilecik Merkez Mali Hizmetler Müdürlüğü - Finansal Hizmetler - Mahalli İdare Bütçesi - Kırtasiye Alımı)_

> **Not:** Sistem yöneticileri `Mevzuat ve Sistem Parametreleri` sekmesindeki **KOD_SOZLUGU** üzerinden kuruma özel birimleri ve kodları bir kez "Metadata" olarak tanımlar. Kullanıcılar ise ayarlar ekranında sadece listeden ilgili birimi seçerek tüm kodları otomatik eşleştirmiş olur.
