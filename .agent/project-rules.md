# Doğrudan Temin Masaüstü Uygulaması (dt-desktop-app) Geliştirme Kuralları

Bu dosya, uygulamanın baştan yazılma sürecinde uyulması gereken mimari ve teknik kuralları içerir. Antigravity (AI) olarak, verilen her yeni görevde bu kuralları göz önünde bulunduracağım.

## 1. Temel Teknoloji Yığını

- **Arayüz (Frontend):** Electron.js + TSX (React) + Vite (veya Electron-Vite).
- **Stil:** Tailwind CSS (`rem` tabanlı, erişilebilir ölçüler) + Radix UI (Headless bileşenler).
- **Veritabanı:** Yerel SQLite (önerilen: `better-sqlite3`).
- **Dil:** TypeScript (tüm yapı sıkı tiplendirmeli olacak).

## 2. Mimari Prensipler

- **CQRS (Command Query Responsibility Segregation):** Veri yazma (Command) ve veri okuma (Query) işlemleri birbirinden tamamen ayrılacaktır. Her işlemin kendi handler'ı (işleyicisi) olacaktır.
- **Repository Pattern:** Veritabanı erişimleri doğrudan bileşenler veya handler'lar içinden yapılmayacak; veri erişimi Repository katmanı üzerinden soyutlanacaktır.

## 3. Uygulama İşlevselliği ve Özellikler

- **Çevrimdışı (Offline) Çalışma:** Uygulama tamamen çevrimdışı çalışmalıdır. Hiçbir veri buluta veya dış sunucuya gönderilmeyecektir.
- **.dtm Dosya Formatı:** Veriler ZIP tabanlı `.dtm` dosyalarında tutulacaktır. Bu dosya içinde `database.sqlite` (ana veri) ve `attachments/` (ekler) bulunacaktır.
- **Mevzuata Uygunluk:** 4734 Sayılı Kamu İhale Kanunu Madde 22 kapsamında doğrudan temin süreçlerine uygun adım adım rehberli iş akışı sağlanacaktır.
- **Modülerlik:** Sınırsız dosya ve kalem eklenebilecek, kurumsal şablonlar `.docx` ve `.xlsx` formatlarında dışa aktarılabilecektir. *(Not: UYAP/DYS .UDF formatı kapalı bir format olduğundan şu aşamada desteklenmemektedir.)*

## 4. Electron Güvenlik Kuralları (Kritik)

Electron uygulamasının güvenliği için aşağıdaki best-practice'ler uygulanmak zorundadır:
- **`nodeIntegration: false`**: Renderer sürecinde (frontend) Node.js API'lerine doğrudan erişim kesinlikle kapalı olacaktır.
- **`contextIsolation: true`**: Renderer ve Main process ortamları birbirinden tamamen izole edilecektir.
- **Preload Script Kullanımı:** Frontend'in ihtiyaç duyduğu Main process işlevleri (`ipcRenderer.invoke`), sadece tanımlanmış ve kısıtlanmış bir **Preload köprüsü** (`window.electron` veya `window.api`) üzerinden sunulacaktır.

## 5. Test Stratejisi

Mimari kararların (CQRS ve Repository) sürdürülebilirliği için kapsamlı bir test stratejisi uygulanacaktır:
- **Birim (Unit) Testleri:** Command/Query Handler'lar ve Repository katmanındaki iş mantıkları (business logic) `Vitest` veya `Jest` kullanılarak test edilecektir.
- **Entegrasyon Testleri:** Veritabanı bağlantıları ve IPC mesajlaşma kanallarının doğru çalıştığı entegrasyon testleriyle doğrulanacaktır.
- **E2E (Uçtan Uca) Testleri:** Kritik kullanıcı akışları (dosya oluşturma, onay süreçleri vb.) `Playwright` veya benzeri bir framework ile test edilecektir.

## 6. Somut Klasör Yapısı

Aşağıdaki klasör ağacı projede standart olarak kullanılacaktır:

```text
src/
├── main/                 # Electron Main Process (Node.js)
│   ├── core/             # IPC kayıtları, Preload, MainWindow kurulumu
│   ├── database/         # SQLite bağlantısı ve migration'lar
│   ├── repositories/     # Veritabanı okuma/yazma soyutlamaları
│   │   ├── institution.repository.ts
│   │   └── dossier.repository.ts
│   ├── commands/         # Veri yazma işlemleri (CQRS - Commands)
│   │   ├── handlers/     # Command Handler'lar
│   │   └── dtos/         # Veri taşıma objeleri
│   └── queries/          # Veri okuma işlemleri (CQRS - Queries)
│       └── handlers/     # Query Handler'lar
│
├── preload/              # IPC Köprüsü (Bridge)
│   └── index.ts          # contextBridge.exposeInMain tanımları
│
└── renderer/             # Frontend (React + Vite)
    ├── src/
    │   ├── components/   # Ortak bileşenler (UI, Layout)
    │   ├── hooks/        # React Query hook'ları (IPC çağrılarını sarar)
    │   ├── screens/      # Sayfalar ve Görünümler
    │   ├── store/        # Zustand (Global State)
    │   └── utils/        # Formatlayıcılar, yardımcı fonksiyonlar
```
