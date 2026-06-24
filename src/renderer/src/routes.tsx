import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { PageWrapper } from './components/layout/PageWrapper'
import DashboardScreen from './screens/dashboard/index.screen'
import DosyalarScreen from './screens/dosyalar/index.screen'
import FirmalarScreen from './screens/firmalar/index.screen'
import PersonelScreen from './screens/personel/index.screen'
import { MevzuatScreen } from './screens/system/MevzuatScreen'
import ChangelogScreen from './screens/system/ChangelogScreen'
import ImportScreen from './screens/system/ImportScreen'
import YardimScreen from './screens/system/YardimScreen'
import AyarlarScreen from './screens/ayarlar/index.screen'
import TemaScreen from './screens/ayarlar/TemaScreen'
import BirimlerScreen from './screens/birimler/index.screen'
import AmbarScreen from './screens/ambar/index.screen'
import MalzemelerScreen from './screens/malzemeler/index.screen'
import TasinirKodScreen from './screens/tasinirkod/index.screen'
import KurumScreen from './screens/kurum/index.screen'
import ProfilScreen from './screens/profil/index.screen'
import DosyaScreen from './screens/dosya/index.screen'
import SablonlarScreen from './screens/sablonlar/index.screen'
import RaporlarScreen from './screens/raporlar/index.screen'
import OkasKodScreen from './screens/okaskod/index.screen'
import OlcuBirimleriScreen from './screens/olcubirimleri/index.screen'
import YeniMalzemeScreen from './screens/malzemeler/yeni.screen'
import YeniDosyaScreen from './screens/dosyalar/yeni.screen'
import KomisyonlarScreen from './screens/komisyonlar/index.screen'
import KomisyonDetayScreen from './screens/komisyonlar/detay.screen'
import KomisyonGorevleriScreen from './screens/komisyon-gorevleri/index.screen'

const rootRoute = createRootRoute({
  component: PageWrapper
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardScreen
})

const dosyalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosyalar',
  component: DosyalarScreen
})

const yeniDosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosyalar/yeni',
  component: YeniDosyaScreen
})

const firmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/firmalar',
  component: FirmalarScreen
})

const personelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/personel',
  component: PersonelScreen
})

const sablonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sablonlar',
  component: SablonlarScreen
})

const komisyonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/komisyonlar',
  component: KomisyonlarScreen
})

const komisyonDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/komisyonlar/detay',
  component: KomisyonDetayScreen
})

const komisyonGorevleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/komisyon-gorevleri',
  component: KomisyonGorevleriScreen
})

import { TakipScreen } from './screens/system/TakipScreen'

// Dynamic routes
const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/takip',
  component: TakipScreen
})


const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/raporlar',
  component: RaporlarScreen
})

const okasKodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/okaskod',
  component: OkasKodScreen
})

const mevzuatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mevzuat',
  component: MevzuatScreen
})

const changelogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/changelog',
  component: ChangelogScreen
})

const yardimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/yardim',
  component: YardimScreen
})

const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/import',
  component: ImportScreen
})

const ayarlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ayarlar',
  component: AyarlarScreen
})

const temaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tema',
  component: TemaScreen
})

const birimlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/birimler',
  component: BirimlerScreen
})

const ambarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ambar',
  component: AmbarScreen
})

const malzemelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/malzemeler',
  component: MalzemelerScreen
})

const tasinirkodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasinirkod',
  component: TasinirKodScreen
})

const kurumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kurum',
  component: KurumScreen
})

import {
  FiyatArastirmaKomisyonu,
  MuayeneKabulKomisyonu,
  FiyatArastirmaMuayeneKomisyonu,
  KomisyonAtamaOnayEki,
  MalzemeListesi,
  IhtiyacListesiTalepFormu,
  LuzumMuzekkeresiBelgesi,
  LuzumOnayEki,
  LuzumTeslimTesellum,
  IstekliFirmalar,
  YaklasikMaliyetCetveli,
  PiyasaArastirmaTutanağı,
  DogrudanTeminOnayBelgesi,
  IhaleOnayBelgesi,
  ButceSorgusu,
  HarcamaTalimati,
  HarcamaPusulasi,
  CiktiMerkeziScreen
} from './screens/dosya/SubScreens.screen'

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profil',
  component: ProfilScreen
})

const dosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya',
  component: DosyaScreen
})

// 1. Komisyon
const fiyatArastirmaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/komisyon/fiyat-arastirma',
  component: FiyatArastirmaKomisyonu
})
const muayeneKabulRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/komisyon/muayene-kabul',
  component: MuayeneKabulKomisyonu
})
const fiyatMuayeneRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/komisyon/fiyat-muayene',
  component: FiyatArastirmaMuayeneKomisyonu
})
const komisyonOnayEkiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/komisyon/onay-eki',
  component: KomisyonAtamaOnayEki
})

// 2. Malzemeler
const malzemeListesiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/malzemeler/liste',
  component: MalzemeListesi
})

// 3. Luzum
const luzumBelgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/luzum/belge',
  component: LuzumMuzekkeresiBelgesi
})
const luzumOnayEkiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/luzum/onay-eki',
  component: LuzumOnayEki
})
const luzumTeslimTesellumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/luzum/teslim-tesellum',
  component: LuzumTeslimTesellum
})

// 4. Firmalar & Maliyet
const istekliFirmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/firmalar-maliyet/istekliler',
  component: IstekliFirmalar
})
const yaklasikMaliyetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/firmalar-maliyet/yaklasik',
  component: YaklasikMaliyetCetveli
})
const piyasaArastirmaTutanakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/firmalar-maliyet/tutanak',
  component: PiyasaArastirmaTutanağı
})

// 5. Onay
const dtOnayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/onay/dt-onay',
  component: DogrudanTeminOnayBelgesi
})
const ihaleOnayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/onay/ihale-onay',
  component: IhaleOnayBelgesi
})
const butceSorguRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/onay/butce-sorgu',
  component: ButceSorgusu
})

// 6. Harcama
const harcamaTalimatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/harcama/talimat',
  component: HarcamaTalimati
})
const harcamaPusulaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/harcama/pusula',
  component: HarcamaPusulasi
})

const ciktiMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya/cikti-merkezi',
  component: CiktiMerkeziScreen
})

const olcubirimleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/olcubirimleri',
  component: OlcuBirimleriScreen
})

const yeniMalzemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/malzemeler/yeni',
  component: YeniMalzemeScreen
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dosyalarRoute,
  yeniDosyaRoute,
  firmalarRoute,
  personelRoute,
  sablonlarRoute,
  komisyonlarRoute,
  komisyonDetayRoute,
  komisyonGorevleriRoute,
  takipRoute,
  raporlarRoute,
  okasKodRoute,
  mevzuatRoute,
  changelogRoute,
  importRoute,
  ayarlarRoute,
  temaRoute,
  birimlerRoute,
  ambarRoute,
  malzemelerRoute,
  yeniMalzemeRoute,
  tasinirkodRoute,
  olcubirimleriRoute,
  kurumRoute,
  profilRoute,
  dosyaRoute,
  fiyatArastirmaRoute,
  muayeneKabulRoute,
  fiyatMuayeneRoute,
  komisyonOnayEkiRoute,
  malzemeListesiRoute,
  talepFormuRoute,
  luzumBelgeRoute,
  luzumOnayEkiRoute,
  luzumTeslimTesellumRoute,
  istekliFirmalarRoute,
  yaklasikMaliyetRoute,
  piyasaArastirmaTutanakRoute,
  dtOnayRoute,
  ihaleOnayRoute,
  butceSorguRoute,
  harcamaTalimatRoute,
  harcamaPusulaRoute,
  ciktiMerkeziRoute,
  yardimRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
