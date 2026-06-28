// ============================================================================
// 4734 SAYILI KAMU İHALE KANUNU (KİK) MEVZUAT BENTLERİ VE İHALE USULLERİ
// ============================================================================

export interface MevzuatBent {
  bent: string
  kisaAd: string
  aciklama: string
  detay: string
  parasal_limit: boolean
  limit_notu?: string
  yuzde_siniri?: string
  sure_siniri?: string
  ilan_zorunlu_mu?: boolean
}

export interface IhaleUsulDuzenleme {
  kod: string
  ad: string
  aciklama: string
  kanun_madde: string
  ilan_zorunlu_mu: boolean | string
  bentler: MevzuatBent[]
}

// Bütün mevzuat yapısını tek bir obje altında toplayan ana yapı
export const MEVZUAT_REHBERI = {
  ihaleUsulleri: {
    '19': {
      kod: '19',
      ad: 'Açık İhale Usulü',
      aciklama: 'Bütün isteklilerin teklif verebildiği temel ihale usulüdür.',
      kanun_madde: 'Madde 19',
      ilan_zorunlu_mu: true,
      bentler: []
    } as IhaleUsulDuzenleme,

    '20': {
      kod: '20',
      ad: 'Belli İstekliler Arasında İhale Usulü',
      aciklama:
        'Ön yeterlik değerlendirmesi sonucu davet edilen isteklilerin teklif verebildiği usul.',
      kanun_madde: 'Madde 20',
      ilan_zorunlu_mu: true,
      bentler: []
    } as IhaleUsulDuzenleme,

    '21': {
      kod: '21',
      ad: 'Pazarlık Usulü',
      aciklama:
        'Kanunda belirtilen özel hallerde ilan yapılarak veya yapılmaksızın pazarlıkla yapılan usul.',
      kanun_madde: 'Madde 21',
      ilan_zorunlu_mu: 'Bente göre değişir',
      bentler: [
        {
          bent: 'a',
          kisaAd: 'Teklif Çıkmaması',
          aciklama:
            'Açık ihale usulü veya belli istekliler arasında ihale usulü ile yapılan ihale sonucunda teklif çıkmaması.',
          detay: 'İhale şartnamesi ve evraklarında değişiklik yapılmadan pazarlığa çıkılabilir.',
          ilan_zorunlu_mu: true,
          parasal_limit: false
        },
        {
          bent: 'b',
          kisaAd: 'Afet, Salgın ve Acil Durumlar',
          aciklama:
            'Doğal afetler, salgın hastalıklar, can veya mal kaybı tehlikesi gibi ani ve beklenmeyen olayların ortaya çıkması veya idarece ivedi alım zorunluluğu.',
          detay:
            'En çok tercih edilen acil durum alım maddesidir. İlan yapılması zorunlu değildir. En az 3 istekli davet edilir.',
          ilan_zorunlu_mu: false,
          parasal_limit: false
        },
        {
          bent: 'c',
          kisaAd: 'Savunma ve Güvenlik Özel Durumları',
          aciklama:
            'Savunma ve güvenlikle ilgili özel durumların ortaya çıkması üzerine ivedi olarak yapılması gereken alımlar.',
          detay:
            'Milli savunma ve iç güvenlik ihtiyaçlarında gizlilik gerektirmeyen ama acil olan durumlarda kullanılır.',
          ilan_zorunlu_mu: false,
          parasal_limit: false
        },
        {
          bent: 'd',
          kisaAd: 'Ar-Ge ve Seri Üretime Konu Olmayan Alımlar',
          aciklama:
            'İhalenin, araştırma ve geliştirme sürecine ihtiyaç gösteren ve seri üretime konu olmayan nitelikte olması.',
          detay: 'Prototip geliştirme, yeni bir teknolojinin test edilmesi gibi AR-GE alımları.',
          ilan_zorunlu_mu: true,
          parasal_limit: false
        },
        {
          bent: 'e',
          kisaAd: 'Özgün ve Karmaşık İşler',
          aciklama:
            'İhale konusu işin özgün nitelikte ve karmaşık olması nedeniyle teknik ve malî özelliklerinin net olarak belirlenememesi.',
          detay: 'Özel yazılım projeleri, ileri mühendislik gerektiren teknik danışmanlıklar vb.',
          ilan_zorunlu_mu: true,
          parasal_limit: false
        },
        {
          bent: 'f',
          kisaAd: 'Parasal Limitli Pazarlık',
          aciklama:
            'İdarelerin yaklaşık maliyeti kanunda belirtilen limit sınırına kadar olan mamul mal, malzeme veya hizmet alımları.',
          detay:
            'KİK limitlerine tabidir. İlan yapılması zorunlu değildir. En az 3 istekli davet edilerek pazarlık yapılır.',
          ilan_zorunlu_mu: false,
          parasal_limit: true,
          limit_notu: 'KİK tebliğ limitlerine tabidir'
        }
      ]
    } as IhaleUsulDuzenleme,

    '22': {
      kod: '22',
      ad: 'Doğrudan Temin',
      aciklama:
        'İlan yapılmaksızın ve teminat alınmaksızın doğrudan piyasadan yapılan alım yöntemi.',
      kanun_madde: 'Madde 22',
      ilan_zorunlu_mu: false,
      bentler: [
        {
          bent: 'a',
          kisaAd: 'Tek Kaynak (Tekel)',
          aciklama: 'İhtiyacın sadece gerçek veya tüzel tek kişi tarafından karşılanabilmesi.',
          detay: 'Yed-i vahit belgesi veya tek kaynak tutanağı ile tevsik edilmesi zorunludur.',
          parasal_limit: false
        },
        {
          bent: 'b',
          kisaAd: 'Özel Hak / Patent / Sanatsal',
          aciklama:
            'Sadece gerçek veya tüzel tek kişinin ihtiyaçla ilgili özel bir hakka sahip olması.',
          detay:
            'Bilimsel, teknik, fikri veya sanatsal nedenlerle münhasır hak. Örn: bilimsel yayın, telif eseri, belirli akademisyenden eğitim.',
          parasal_limit: false
        },
        {
          bent: 'c',
          kisaAd: 'Uyumluluk / Standardizasyon',
          aciklama:
            'Mevcut mal, ekipman, teknoloji veya hizmetlerle uyum ve standardizasyon için zorunlu mal/hizmet alımı.',
          detay:
            'Asıl sözleşmeye dayalı, toplam süresi 3 yılı geçmeyecek şekilde ilk alım yapılan kişiden alınır. KİK022.0/M veya KİK021.0/H formu düzenlenir.',
          parasal_limit: false,
          sure_siniri: '3 yıl'
        },
        {
          bent: 'd',
          kisaAd: 'Parasal Limit',
          aciklama:
            'Belirlenen parasal limiti aşmayan mal/hizmet alımları ve yapım işleri ile temsil ağırlama kapsamında konaklama, seyahat ve iaşe alımları.',
          detay:
            "KİK tarafından her yıl güncellenir. Yıllık toplam bütçe ödeneğinin %10'unu aşamaz (Kamu İhale Kurulu onayı olmaksızın).",
          parasal_limit: true,
          limit_notu: 'KİK tarafından yıllık güncellenir',
          yuzde_siniri: '%10 ödenek sınırı'
        },
        {
          bent: 'e',
          kisaAd: 'Taşınmaz Alım / Kiralama',
          aciklama: 'İdarelerin ihtiyacına uygun taşınmaz mal alımı veya kiralanması.',
          detay:
            'Gerekçe belgesi, yer/özellik tespiti raporu ve rayiç araştırması onay belgesine eklenir.',
          parasal_limit: false
        },
        {
          bent: 'f',
          kisaAd: 'Acil İlaç / Tıbbi Sarf',
          aciklama:
            'Özelliğinden dolayı stoklama imkânı bulunmayan ve acil durumlarda kullanılacak ilaç, tıbbi sarf malzemeleri ile test ve tetkik sarf malzemesi.',
          detay: 'Stoklanamaz nitelik ve acil durum tevsik belgeleri harcama belgelerine eklenir.',
          parasal_limit: false
        },
        {
          bent: 'g',
          kisaAd: 'Milletlerarası Tahkim Davaları',
          aciklama:
            'Milletlerarası tahkim yoluyla çözülmesi öngörülen uyuşmazlıklarla ilgili davalarda Türk veya yabancı avukat/ortaklıklardan hizmet alımı.',
          detay:
            'Yalnızca milletlerarası tahkim davalarına münhasırdır; diğer uyuşmazlık çözüm yollarında genel hükümler uygulanır.',
          parasal_limit: false
        },
        {
          bent: 'ğ',
          kisaAd: 'Savunma / Güvenlik (Gizlilik)',
          aciklama:
            'Savunma, güvenlik veya istihbarat alanında gizlilik içeren ve doğrudan teminle alınması gereken ihtiyaçlar.',
          detay:
            'İlgili güvenlik mevzuatı ve Cumhurbaşkanlığı kararnameleri kapsamında değerlendirilir.',
          parasal_limit: false
        },
        {
          bent: 'h',
          kisaAd: 'Sözleşme Feshi Sonrası Acil Alım',
          aciklama:
            'Sözleşmenin feshedilmesi veya sözleşme yapılamaması halinde işin acilen bitirilmesinin zorunlu olması.',
          detay:
            'Fesih/iptal kararının ardından yeni ihale yapılana kadar geçecek sürede geçici tedbir niteliğindedir.',
          parasal_limit: false
        },
        {
          bent: 'ı',
          kisaAd: 'Türkiye İş Kurumu (İŞKUR)',
          aciklama:
            "Türkiye İş Kurumu'nun 4904 sayılı Kanun kapsamındaki görevlerine ilişkin hizmet alımları ile İşsizlik Sigortası Kanunu kapsamındaki alımlar.",
          detay: "Yalnızca İŞKUR'un yasal görevleriyle sınırlı alımları kapsar.",
          parasal_limit: false
        },
        {
          bent: 'i',
          kisaAd: 'Seçim Malzemesi ve Kağıt Alımı',
          aciklama:
            'Seçim yenilenmesi veya ara seçim kararında YSK tarafından yapılacak filigranlı oy pusulası/zarfı kağıdı alımı ve oy pusulası basım hizmeti.',
          detay:
            'YSK ve İl Seçim Kurulu başkanlıkları tarafından alınan oy pusulası basım hizmetlerini kapsar.',
          parasal_limit: false
        }
      ]
    } as IhaleUsulDuzenleme,

    '3': {
      kod: '3',
      ad: 'İstisnalar',
      aciklama: 'Kamu İhale Kanununa tabi olmayan özel/istisnai alım yöntemleri.',
      kanun_madde: 'Madde 3',
      ilan_zorunlu_mu: false,
      bentler: [
        {
          bent: 'a',
          kisaAd: 'Tarım ve Hayvancılık / Orman Köyleri',
          aciklama:
            'Doğrudan üreticilerden yapılan tarım veya hayvancılıkla ilgili ürün alımları ile Orman Kanunu kapsamındaki kooperatif ve köylülerden alımlar.',
          detay:
            'Orman kooperatifleri veya orman köylülerinin iş gücü alımları ile tarımsal ürünlerin işlenmesi/satışı bu kapsamdadır.',
          parasal_limit: false
        },
        {
          bent: 'b',
          kisaAd: 'Savunma, Güvenlik ve Istihbarat',
          aciklama:
            'Savunma, güvenlik veya istihbarat alanları ile ilişkili olan ya da gizlilik içinde yürütülmesi gerektiğine idarece karar verilen alımlar.',
          detay: 'İlgili bakanlık veya idarenin gizlilik kararı onay belgesine eklenir.',
          parasal_limit: false
        },
        {
          bent: 'c',
          kisaAd: 'Uluslararası Anlaşmalar (Dış Finansman)',
          aciklama:
            'Uluslararası anlaşmalar gereğince sağlanan dış finansman ile yaptırılacak ve anlaşmasında farklı ihale usulleri belirlenmiş alımlar.',
          detay:
            'Dış finansman anlaşmasında yer alan özel şartlar, Dünya Bankası vb. kurumların usulleri uygulanır.',
          parasal_limit: false
        },
        {
          bent: 'd',
          kisaAd: 'Yabancı Ülkelerdeki Dış Teşkilat Alımları',
          aciklama:
            'İdarelerin yabancı ülkelerdeki kuruluşlarının (Büyükelçilik, Ataşelik vb.) mal veya hizmet alımları.',
          detay: 'Yurtdışı temsilcilikleri, ataşelikler vb. dış teşkilat alımları için geçerlidir.',
          parasal_limit: false
        },
        {
          bent: 'e',
          kisaAd: 'Kamu Kurumları Üretimleri (İşyurtları / DMO)',
          aciklama:
            'Ceza infaz kurumları işyurtları, DMO, döner sermaye işletmeleri vb. kuruluşların kendi ürettikleri mal ve hizmet alımları.',
          detay:
            'Adalet Bakanlığı İşyurtları Kurumu, Devlet Malzeme Ofisi (DMO) gibi kamu kuruluşlarının ürettiği malların doğrudan alımını kapsar.',
          parasal_limit: false
        },
        {
          bent: 'f',
          kisaAd: 'Ar-Ge ve Bilimsel Araştırma Projeleri (BAP/TÜBİTAK)',
          aciklama:
            'Ulusal araştırma-geliştirme kurumlarının yürüttüğü ve desteklediği Ar-Ge projeleri için gerekli olan mal ve hizmet alımları.',
          detay:
            'BAP (Bilimsel Araştırma Projeleri), TÜBİTAK vb. Ar-Ge projeleri kapsamındaki üniversite ve kurum alımları.',
          parasal_limit: false
        },
        {
          bent: 'g',
          kisaAd: 'Ticari ve Sınai Faaliyet Alımları',
          aciklama:
            'Kuruluş amaçlarına uygun olarak yürüttükleri ticari ve sınai faaliyetleri ile sınırlı mal ve hizmet alımları.',
          detay:
            'İktisadi kamu teşebbüsleri, belediye iştirak şirketleri vb. ticari faaliyetlerine yönelik alımları kapsar.',
          parasal_limit: false
        },
        {
          bent: 'h',
          kisaAd: 'Kültür ve Sanat Faaliyetleri / Restorasyon',
          aciklama:
            'Kültür ve sanat varlıklarının korunması, restorasyonu veya sanatsal faaliyetlerin yürütülmesi için gereken alımlar.',
          detay:
            'Kültür Bakanlığı restorasyon projeleri, tiyatro/opera gösterileri, müze alımları vb.',
          parasal_limit: false
        }
      ]
    } as IhaleUsulDuzenleme
  },
  enSikKullanilanDogrudanTeminBentleri: ['d', 'e', 'f', 'c']
}

// Geriye dönük uyumluluk (backwards compatibility) için eski export'lar
export const IHALE_USULLERI = Object.values(MEVZUAT_REHBERI.ihaleUsulleri).map((u) => ({
  kod: u.kod,
  ad: u.ad,
  aciklama: u.aciklama,
  kanun_madde: u.kanun_madde,
  ilan_zorunlu_mu: u.ilan_zorunlu_mu
}))

export const MADDE_21_PAZARLIK_BENTLERI = MEVZUAT_REHBERI.ihaleUsulleri['21'].bentler
export const MADDE_22_BENTLERI = MEVZUAT_REHBERI.ihaleUsulleri['22'].bentler
export const MADDE_3_ISTISNA_BENTLERI = MEVZUAT_REHBERI.ihaleUsulleri['3'].bentler
export const SIKKULLANILANLAR = MEVZUAT_REHBERI.enSikKullanilanDogrudanTeminBentleri
