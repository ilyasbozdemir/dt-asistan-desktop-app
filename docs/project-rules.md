# Doğrudan Temin Masaüstü Uygulaması (dt-asistan-desktop-app) Geliştirme Kuralları

Bu dosya, uygulamanın baştan yazılma sürecinde uyulması gereken mimari ve teknik
kuralları içerir. Antigravity (AI) olarak, verilen her yeni görevde bu kuralları
göz önünde bulunduracağım.

## 1. Temel Teknoloji Yığını

- **Arayüz (Frontend):** Electron.js + TSX (React) + Vite (veya Electron-Vite).
- **Stil:** Tailwind CSS (`rem` tabanlı, erişilebilir ölçüler) + Radix UI
  (Headless bileşenler).
- **Veritabanı:** Yerel SQLite (önerilen: `better-sqlite3`). SQLite içinde de
  bir migrations tablosu tutulacak (`schema_migrations`).
- **Dil:** TypeScript (tüm yapı sıkı tiplendirmeli olacak).

## 2. Mimari Prensipler

- **CQRS (Command Query Responsibility Segregation):** Veri yazma (Command) ve
  veri okuma (Query) işlemleri birbirinden tamamen ayrılacaktır. Her işlemin
  kendi handler'ı (işleyicisi) olacaktır.
- **Repository Pattern:** Veritabanı erişimleri doğrudan bileşenler veya
  handler'lar içinden yapılmayacak; veri erişimi Repository katmanı üzerinden
  soyutlanacaktır.

## 3. Uygulama İşlevselliği ve Özellikler

- **Çevrimdışı (Offline) Çalışma:** Uygulama tamamen çevrimdışı çalışmalıdır.
  Hiçbir veri buluta veya dış sunucuya gönderilmeyecektir.
- **.dtal Dosya Formatı:** Veriler ZIP tabanlı `.dtal` dosyalarında tutulacaktır.
  Bu dosya içinde `database.sqlite` (ana veri) ve `attachments/` (ekler)
  bulunacaktır.
- **Mevzuata Uygunluk:** 4734 Sayılı Kamu İhale Kanunu Madde 22 kapsamında
  doğrudan temin süreçlerine uygun adım adım rehberli iş akışı sağlanacaktır.
- **Modülerlik:** Sınırsız dosya ve kalem eklenebilecek, kurumsal şablonlar
  `.docx` ve `.xlsx` formatlarında dışa aktarılabilecektir. _(Not: UYAP/DYS .UDF
  formatı kapalı bir format olduğundan şu aşamada desteklenmemektedir.)_

## 4. IPC İletişim Kuralları

- Renderer, hiçbir zaman doğrudan `ipcRenderer` çağırmaz; sadece preload'da
  tanımlı, tipli API'leri kullanır.
- `preload/index.ts` örneği:
  ```typescript
  contextBridge.exposeInMainWorld('api', {
    dosya: {
      create: (input: CreateDosyaInput) => ipcRenderer.invoke('dosya:create', input),
      list: (filter: DosyaFilter) => ipcRenderer.invoke('dosya:list', filter)
    }
  })
  ```
- Her IPC kanalı isimlendirmesi `<modül>:<eylem>` formatında olacaktır (örn.
  `dosya:create`, `komisyon:list`).
- Main process tarafında her `ipcMain.handle` çağrısı, ilgili Command/Query
  handler'ını tetiklemekten başka iş yapmaz (ince/thin adapter).

## 5. Validation Katmanı (zod)

- Dış kaynaklı tüm veri (kullanıcı formu, .dtm import, dosya okuma) `zod` şeması
  ile doğrulanacaktır.
- Her Command/Query, çalışmadan önce kendi giriş şemasını (`*.schema.ts`)
  validate eder.
- Validation hatası, kullanıcıya Türkçe ve anlaşılır mesajla iletilir (örn.
  "Tutar alanı boş bırakılamaz").

## 6. Electron Güvenlik Kuralları (Tüm Pencereler İçin Zorunlu)

Uygulamadaki her `BrowserWindow` (ana pencere, PDF export penceresi vb. dahil),
istisnasız aşağıdaki `webPreferences` ayarlarına sahip olacaktır:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- `preload` script kullanımı zorunludur; renderer'a açılacak API'ler yalnızca
  `contextBridge.exposeInMainWorld()` ile, kontrollü şekilde sunulur.
- Renderer process doğrudan Node.js veya Electron modüllerine erişemez.
- **Navigasyon Kilidi:** Ana pencerelerde (main window) `will-navigate` ve
  `setWindowOpenHandler` dinlenerek dış web sitelerinin Electron içinde açılması
  tamamen engellenir.
- **İzinler (Permissions):**
  `session.defaultSession.setPermissionRequestHandler` aracılığıyla, kameraya,
  mikrofona ve diğer donanım API'lerine erişim izinleri varsayılan olarak
  reddedilir (`false`).
- **SQL Injection:** Tüm veritabanı sorguları parametrik (bind) yöntemle
  çalıştırılacaktır, hiçbir zaman string birleştirme yapılamaz.
- **DevTools Kilidi:** Uygulamanın Production ortamında DevTools erişimi
  engellenecektir
  (`window.webContents.on('devtools-opened', () => closeDevTools())`).
- **Plugins Kapalı:** Eski nesil plugin'lerin zafiyetlerinden kaçınmak için
  `plugins: false` ayarı kullanılır.

## 7. Test Stratejisi

- **Birim (Unit) Testleri:** Command/Query Handler'lar ve Repository
  katmanındaki iş mantıkları `Vitest` veya `Jest` kullanılarak test edilecektir.
- **Entegrasyon Testleri:** Veritabanı bağlantıları ve IPC mesajlaşma kanalları
  doğrulanacaktır.
- **E2E (Uçtan Uca) Testleri:** Kritik kullanıcı akışları `Playwright` veya
  benzeri bir framework ile test edilecektir.

## 8. Somut Klasör Yapısı

Aşağıdaki klasör ağacı projede standart olarak kullanılacaktır:

```text
src/
├── main/                 # Electron Main Process (Node.js)
│   ├── core/             # IPC kayıtları, Preload, MainWindow kurulumu
│   ├── database/         # SQLite bağlantısı ve migration'lar
│   ├── repositories/     # Veritabanı okuma/yazma soyutlamaları
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
