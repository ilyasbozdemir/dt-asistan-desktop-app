import React, { useState } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  HelpCircle,
  FileSpreadsheet,
  BookOpen,
  Layers,
  Cpu,
  Layout,
  Info
} from 'lucide-react'
import { ExcelViewer } from '../../components/ui/ExcelViewer'

const DOCUMENTS = [
  {
    category: 'Sistem Kılavuzu & Tanıtım',
    items: [
      {
        id: 'uygulamamizi_yakindan_taniyalim',
        title: 'Uygulamamızı Yakından Tanıyalım',
        description:
          'Uygulama genel yapısı, şablon mekanizması, sayfa yerleşimleri (A4/yarım sayfa) ve dosya/veri mimarisi hakkında detaylı rehber.',
        file: 'system_guide'
      }
    ]
  },
  {
    category: 'Resmi Yazışma ve Kullanıcı Kılavuzları',
    items: [
      {
        id: 'dogrudan_temin_islem_sureci',
        title: 'Doğrudan Temin İşlem Süreci',
        description:
          'Doğrudan temin alım sürecinin adım adım tüm aşamaları (lüzum müzekkeresinden ödeme emrine).',
        file: 'dta-res://docs/dogrudan_temin_islem_sureci.doc'
      },
      {
        id: 'resmi_yazisma_kurallari',
        title: 'Resmi Yazışma Kuralları',
        description: 'Resmi yazışmalarda uyulması gereken kurallar ve standartlar.',
        file: 'dta-res://docs/resmi_yazisma_kurallari.pdf'
      },
      {
        id: 'resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu',
        title: 'Resmi Yazışmalar Yönetmelik Kılavuzu',
        description: 'Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik Kılavuzu.',
        file: 'dta-res://docs/resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu.pdf'
      },
      {
        id: 'dogrudan_temin_son_kullanici_kilavuzu',
        title: 'Doğrudan Temin Son Kullanıcı Kılavuzu',
        description:
          'Doğrudan Temin süreci ve uygulamanın kullanımı hakkında son kullanıcı kılavuzu.',
        file: 'dta-res://docs/dogrudan_temin_son_kullanici_kilavuzu.pdf'
      },
      {
        id: '20200610-8',
        title: 'Faydalı Doküman (20200610-8)',
        description: 'İlgili resmi mevzuat dokümanı.',
        file: 'dta-res://docs/20200610-8.pdf'
      }
    ]
  },
  {
    category: 'Muhasebat & Maliyet Dokümanları',
    items: [
      {
        id: 'guncel_tasinir_kod_listesi',
        title: 'Güncel Taşınır Kod Listesi',
        description: 'Taşınır hesap planer ve kod listesi (Güncel).',
        file: 'dta-res://docs/muhasebat/guncel_tasinir_kod_listesi.xls'
      },
      {
        id: '2018_mahalli_idareler_detayli_hesap_plani',
        title: 'Mahalli İdareler Detaylı Hesap Planı (2018)',
        description: 'Mahalli idareler için detaylı muhasebat hesap planı excel tablosu.',
        file: 'dta-res://docs/muhasebat/2018_mahalli_idareler_detayli_hesap_plani.xls'
      },
      {
        id: 'defter_belge_ve_cetvel_ornekleri',
        title: 'Defter, Belge ve Cetvel Örnekleri',
        description: 'Muhasebat süreçleri için defter, belge ve cetvel örnekleri.',
        file: 'dta-res://docs/muhasebat/defter_belge_ve_cetvel_ornekleri.xlsx'
      },
      {
        id: 'ek_10_teslim_sureleri_tablosu',
        title: 'EK-10 Teslim Süreleri Tablosu',
        description: 'Resmi evrak ve faturaların teslim süreleri tablosu.',
        file: 'dta-res://docs/muhasebat/ek_10_teslim_sureleri_tablosu.xlsx'
      },
      {
        id: 'kurumsal_2019_2021',
        title: 'Kurumsal Muhasebat Kılavuzu (2019-2021)',
        description: 'Kurumsal kılavuz ve mali istatistikler (2019-2021).',
        file: 'dta-res://docs/muhasebat/kurumsal_2019_2021.pdf'
      },
      {
        id: '5816_2',
        title: 'Mali Mevzuat Dokümanı (5816_2)',
        description: 'Maliye ve Muhasebat ilgili mevzuat PDF dokümanı.',
        file: 'dta-res://docs/muhasebat/5816_2.pdf'
      },
      {
        id: 'giderlerin_ekonomik_siniflandirilmasi_tablosu',
        title: 'Giderlerin Ekonomik Sınıflandırılması Tablosu',
        description: 'Bütçe giderlerinin ekonomik sınıflandırma (03, 03.2 vb.) detayları tablosu.',
        file: 'dta-res://docs/muhasebat/giderlerin_ekonomik_siniflandirilmasi_tablosu.pdf'
      },
      {
        id: 'butce_giderleri_ve_odenekler_tablosu',
        title: 'Bütçe Giderleri ve Ödenekler Tablosu',
        description: 'Bütçe giderleri, ödenek türleri ve harcama tertipleri tablosu.',
        file: 'dta-res://docs/muhasebat/butce_giderleri_ve_odenekler_tablosu.pdf'
      },
      {
        id: 'mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi',
        title: 'Mahalli İdareler Gelir Gider ve Bütçe Karşılaştırması',
        description: 'Mahalli idarelerde bütçe hesapları ve karşılaştırmalı kılavuz.',
        file: 'dta-res://docs/muhasebat/mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi.pdf'
      }
    ]
  }
]

const DogrudanTeminSurecAkisi = () => {
  const [activeSubTab, setActiveSubTab] = useState<'roller' | 'surec'>('roller')

  const roles = [
    {
      step: '1',
      title: 'İHTİYAÇ / TALEP',
      role: 'İhtiyaç Sahibi Birim',
      desc: 'Harcama birimi fiili ihtiyacı tespit eder.',
      action:
        '“Şuna ihtiyacım var” diyerek İhtiyaç Listesi / Talep Formu (Lüzum Müzekkeresi) oluşturur ve süreci başlatır.',
      bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200 dark:border-blue-900/50',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    },
    {
      step: '2',
      title: 'HARCAMA YETKİLİSİ',
      role: 'Birim Amiri (Müdür, Başkan, Rektör vb.)',
      desc: 'Harcamaya karar veren ve bütçeyi kullandıran ana yetkili.',
      action:
        '“Bu alım yapılsın” talimatı verir, Onay Belgesini imzalar. Sürecin en üst sorumlusudur.',
      bg: 'from-amber-50 to-orange-50 dark:from-amber-955/20 dark:to-orange-955/10 border-amber-200 dark:border-amber-900/50',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
    },
    {
      step: '3',
      title: 'GERÇEKLEŞTİRME GÖREVLİSİ',
      role: 'Satın Alma Müdürü, Şef, Görevlendirilen Personel',
      desc: 'Harcama yetkilisinin talimatıyla alım işlemlerini fiilen yürüten kişi.',
      action:
        'Piyasa fiyat araştırması yapar, teklifleri alır. Muayene ve kabul işlemlerini yapar. Ödeme Emri Belgesini hazırlar ve “Mal/hizmet alındı, fatura doğrudur” diyerek imzalar.',
      bg: 'from-purple-50 to-fuchsia-50 dark:from-purple-955/20 dark:to-fuchsia-955/10 border-purple-200 dark:border-purple-900/50',
      text: 'text-purple-700 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
    },
    {
      step: '4',
      title: 'ÖN MALİ KONTROL',
      role: 'Mali Hizmetler Birimi (Müdür / Personel)',
      desc: 'Harcamanın bütçeye ve genel mevzuata uygunluğunu denetleyen birim.',
      action:
        'Ödeneğin yeterli olup olmadığını kontrol eder. Mevzuata uygunluk durumunda “Uygun Görüş” verir.',
      bg: 'from-sky-50 to-cyan-50 dark:from-sky-955/20 dark:to-cyan-955/10 border-sky-200 dark:border-sky-900/50',
      text: 'text-sky-700 dark:text-sky-400',
      iconBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
    },
    {
      step: '5',
      title: 'MUHASEBE YETKİLİSİ',
      role: 'Sayman, Muhasebe Müdürü',
      desc: 'Harcama biriminden tamamen bağımsız, ödemeyi gerçekleştiren merci.',
      action:
        'Gelen hak sahibi belgelerini (fatura, tutanak vb.) son kez kontrol eder. Ödeme Emrini onaylar ve bankadan fiili EFT/havale işlemini yaparak muhasebe kaydını girer.',
      bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-900/50',
      text: 'text-emerald-700 dark:text-emerald-450',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
    }
  ]

  const steps = [
    {
      title: '1- İHTİYACIN TESPİTİ',
      desc: 'Satın alımı talep edilen mal veya hizmet için ihtiyaç duyan birim Lüzum Müzekkeresi veya Talep Formu oluşturur. Bu belge resmi süreci başlatır.'
    },
    {
      title: '2- ONAY BELGESİ DÜZENLENMESİ',
      desc: 'Alım konusu işin niteliği, yaklaşık maliyeti, kullanılabilir ödeneği, bütçe tertibi ve alımda görevli personeli içeren resmi Onay Belgesi hazırlanır ve Harcama Yetkilisinin imzasına sunulur.'
    },
    {
      title: '3- GÖREVLENDİRME YAPILMASI',
      desc: 'Piyasa fiyat araştırması yapmak üzere en az bir (tercihen iki veya daha fazla) Gerçekleştirme Görevlisi onay belgesinde veya ayrı bir yazıyla resmi olarak görevlendirilir.'
    },
    {
      title: '4- PİYASA FİYAT ARAŞTIRMASI',
      desc: 'Görevlendirilen personel piyasadan/istekli tedarikçilerden fiyat tekliflerini toplar. Toplanan bu teklifler resmi Piyasa Fiyat Araştırma Tutanağına işlenerek imzalanır.'
    },
    {
      title: '5- FİYAT ONAYI (HARCAMA YETKİLİSİ)',
      desc: 'Harcama Yetkilisi, piyasa fiyat araştırması sonucunda en uygun bulunan teklifi inceler ve tutanağın altındaki onay/olur alanını imzalayarak alıma onay verir.'
    },
    {
      title: '6- %10 LİMİT KONTROLÜ (4734 s.k. md. 62/i)',
      desc: 'Doğrudan temin yoluyla yapılacak yıllık toplam harcamaların kanuni limit sınırları (%10 eşiği) içinde kalıp kalmadığı bütçe kontrolü kapsamında denetlenir.'
    },
    {
      title: '7- ALIMIN YAPILMASI & MUAYENE KABUL',
      desc: 'Yükleniciden fatura temin edilir. Mal/hizmet teslim alındığında Muayene ve Kabul Komisyonu Tutanağı düzenlenir. Ambar girişi için Taşınır İşlem Fişi (TİF) kesilir.'
    },
    {
      title: '8- ÖDEME EMİR BELGESİ VE HAVALE',
      desc: 'Gerekli tüm kanıtlayıcı belgeler eklenerek Ödeme Emri Belgesi düzenlenir. Gerçekleştirme Görevlisi ve Harcama Yetkilisi imzalarından sonra Muhasebe Yetkilisi ödemeyi hak sahibine EFT/havale yapar.'
    }
  ]

  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Doğrudan Temin & Kamu Harcama Süreci
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            5018 Sayılı Kamu Mali Yönetimi Kanunu Rolleri ve Doğrudan Temin İşlem Adımları Rehberi
          </p>
        </div>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-px">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
            <button
              onClick={() => setActiveSubTab('roller')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'roller'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              👥 5018 Harcama Rolleri
            </button>
            <button
              onClick={() => setActiveSubTab('surec')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'surec'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              ⚙️ Doğrudan Temin İşlem Adımları
            </button>
          </div>
        </div>

        {activeSubTab === 'roller' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                <div
                  key={role.step}
                  className={`bg-gradient-to-r ${role.bg} border rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm shrink-0 ${role.iconBg}`}
                    >
                      {role.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 ${role.text}`}
                        >
                          {role.title}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">
                          {role.role}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-400 leading-normal font-normal">
                        <strong>Tarihsel Görevi:</strong> {role.desc}
                      </p>
                      <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed font-semibold mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                        ⚡ {role.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/50 rounded-2xl p-4 text-xs text-blue-750 dark:text-blue-400 leading-relaxed mt-4">
              📌 <strong>5018 Sayılı Kanun Uyarınca Temel Kural:</strong> Harcama Yetkilisi
              (Onaylayan) ile Muhasebe Yetkilisi (Ödeyen) unvanları{' '}
              <strong>asla aynı kişide birleşemez</strong>. Muhasebe birimi tamamen bağımsız kontrol
              mercii olarak çalışır.
            </div>
          </div>
        )}

        {activeSubTab === 'surec' && (
          <div className="relative border-l-2 border-blue-500 dark:border-blue-700 ml-4 md:ml-6 space-y-6 py-2">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-6 md:pl-8 group">
                <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 dark:border-blue-600 group-hover:scale-125 transition-transform duration-200" />

                <div className="bg-white dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-800 transition-colors">
                  <h3 className="text-xs font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[10px] text-blue-700 dark:text-blue-300 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {step.title}
                  </h3>
                  {step.desc && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal whitespace-pre-wrap">
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const UygulamaRehberi = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Uygulamamızı Yakından Tanıyalım (Sistem Kılavuzu)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uygulamanın genel kullanım akışı, sayfa yazdırma mantığı ve şablon özelleştirme rehberi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Genel Kullanım Akışı */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              1. Genel Kullanım Akışı ve Hızlı Çıktı
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Uygulamanın temel amacı satın alma dosyalarınızı tek merkezden hızlıca hazırlamaktır.
              En verimli süreç akışı şu şekildedir:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Kurum Bilgileri:</strong> İlk olarak kurum bilgilerinizi doldurun. Bu
                veriler tüm belgelerde otomatik olarak kullanılır.
              </li>
              <li>
                <strong>Doğrudan Temin Dosyaları:</strong> Süreç dosyalarınızı oluşturup malzeme,
                komisyon, yaklaşık maliyet gibi detayları girin.
              </li>
              <li>
                <strong>Otomatik Çıktı:</strong> Dosyanızı doldurduğunuzda, tüm süreç evraklarını{' '}
                <strong>Çıktı Merkezi</strong> üzerinden tek tuşla otomatik, hızlı ve resmi formatta
                yazdırabilirsiniz.
              </li>
            </ul>
          </div>

          {/* Card 2: Şablon Yönetimi (Geliştirici Rehberi) */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              2. Şablon Yönetimi (Geliştirici Rehberi)
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Yazdırılabilir resmi belgeler dinamik HTML şablonları üzerinden üretilir. Geliştirici
              veya teknik kullanıcı iseniz:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Şablon Düzenleme:</strong> Uygulama menüsündeki <strong>Şablonlar</strong>{' '}
                ekranından kod bazında HTML ve JSON yapılarını doğrudan özelleştirebilir ve
                düzenleyebilirsiniz.
              </li>
              <li>
                <strong>Mustache Motoru:</strong> HTML şablonlarında <code>{'{{deger}}'}</code>{' '}
                Mustache yapısı kullanılır, dinamik veriler buraya yerleşir.
              </li>
              <li>
                <strong>Şablon Konumu:</strong> Proje dizinindeki <code>resources/templates/</code>{' '}
                klasöründe yer alan kaynak kodlara müdahale edebilirsiniz.
              </li>
            </ul>
          </div>

          {/* Card 3: Çift Nüsha (Half-Page) Hassasiyeti */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4 text-violet-500" />
              3. Çift Nüsha (A4/2) & Dinamik Sayfa Mantığı
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Teslim Tesellüm gibi belgelerde kağıt tasarrufu için A4 sayfasının üst ve alt
              yarısında iki kopya (`half-page`) yer alır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Yarım Sayfa Modu:</strong> Kalem sayısı azsa (≤ 5) iki nüsha tek bir A4
                kağıdına sığdırılır, araya kesikli çizgi konulur.
              </li>
              <li>
                <strong>Dinamik Tam Sayfa (Full-Page):</strong> Eğer malzeme satırı sayısı
                5&apos;ten fazla ise şablondaki DOM scripti otomatik olarak{' '}
                <code>full-page-mode</code> sınıfını ekler.
              </li>
              <li>
                Bu modda iki nüsha da dikey A4 boyutuna genişletilir ve sayfa sonu (`break-after:
                page`) verilerek ardışık iki tam A4 sayfası olarak yazdırılır.
              </li>
            </ul>
          </div>

          {/* Card 4: Veri Entegrasyonu ve Nesne Yapısı */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" />
              4. Kararlı Veri & Dotted Fallback Kuralı
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Kullanıcının bazı alanları (örneğin dosya numarası) boş bırakması ihtimaline karşı
              resmi evraklarda şu kurallar uygulanır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Obje Ayrıştırma:</strong> <code>dosyaNumarasi</code> bir bütün string yerine{' '}
                <code>{'{ yili: "2026", sayisi: "123" }'}</code> şeklinde bir nesne olarak saklanır.
              </li>
              <li>
                <strong>Mustache Fallback:</strong> Sayı değeri girilmediğinde şablonun bozulmaması
                için{' '}
                <code>{'{{yili}}/{{#sayisi}}{{sayisi}}{{/sayisi}}{{^sayisi}}....{{/sayisi}}'}</code>{' '}
                yapısı kullanılır.
              </li>
              <li>
                <strong>Çıktı Güvenliği:</strong> Böylece eksik verilerde çıktı{' '}
                <code>2026/....</code> veya tamamen boş ise <code>..../....</code> şeklinde
                gösterilerek resmi evrak formatı korunur.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Geliştirici & Model Notu:</strong> Şablonları güncellerken veya yeni alanlar
            eklerken bu yerleşim kurallarına ve boş veri yedekleme (fallback) yapılarına sadık
            kalmaya özen gösterin.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function YardimScreen(): React.JSX.Element {
  const [activeDoc, setActiveDoc] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const docId = searchParams.get('doc')
    if (docId) {
      for (const group of DOCUMENTS) {
        const found = group.items.find((item) => item.id === docId)
        if (found) return found
      }
    }
    return DOCUMENTS[0].items[0]
  })

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      <div className="flex-none p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
          <HelpCircle className="w-7 h-7 text-blue-600" />
          Yardım ve Faydalı Dokümanlar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Sistemi kullanırken faydalanabileceğiniz resmi mevzuat, kullanım kılavuzları ve muhasebat
          tablolarına buradan ulaşabilirsiniz.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <div className="w-[340px] flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {DOCUMENTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3">
                {group.category}
              </h2>
              {group.items.map((doc) => {
                const isExcel = doc.file.endsWith('.xls') || doc.file.endsWith('.xlsx')
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      activeDoc.id === doc.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isExcel ? (
                        <FileSpreadsheet
                          className={`w-5 h-5 shrink-0 mt-0.5 ${activeDoc.id === doc.id ? 'text-green-600 dark:text-green-500' : 'text-slate-400'}`}
                        />
                      ) : (
                        <FileText
                          className={`w-5 h-5 shrink-0 mt-0.5 ${activeDoc.id === doc.id ? 'text-blue-600' : 'text-slate-400'}`}
                        />
                      )}
                      <div>
                        <h3
                          className={`text-sm font-semibold mb-1 leading-tight ${activeDoc.id === doc.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {doc.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Right Content - PDF / Excel Viewer Placeholder */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
          <div className="flex-none p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {activeDoc.id === 'uygulamamizi_yakindan_taniyalim' ? (
                <Cpu className="w-4 h-4 text-blue-500" />
              ) : activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              {activeDoc.title}
            </h2>
            <div className="flex items-center gap-2">
              {activeDoc.id !== 'uygulamamizi_yakindan_taniyalim' && (
                <>
                  <a
                    href={activeDoc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Yeni Sekmede Aç / Dışarıda Görüntüle"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Dışarıda Aç
                  </a>
                  <a
                    href={activeDoc.file}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    İndir
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 w-full h-full relative z-0 overflow-hidden bg-white dark:bg-slate-955">
            {activeDoc.id === 'uygulamamizi_yakindan_taniyalim' ? (
              <UygulamaRehberi />
            ) : activeDoc.id === 'dogrudan_temin_islem_sureci' ? (
              <DogrudanTeminSurecAkisi />
            ) : activeDoc.file.endsWith('.pdf') ? (
              <div className="p-4 w-full h-full">
                <iframe
                  src={`${activeDoc.file}#view=FitH`}
                  className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
                  title={activeDoc.title}
                />
              </div>
            ) : activeDoc.file.endsWith('.xls') || activeDoc.file.endsWith('.xlsx') ? (
              <ExcelViewer fileUrl={activeDoc.file} />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {activeDoc.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-8">Önizleme desteklenmiyor.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
