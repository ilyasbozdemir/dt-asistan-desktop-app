import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { PageWrapper } from './components/layout/PageWrapper'
import { APP_ROUTES } from './constants/routeConstants'
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
import DegiskenlerScreen from './screens/sablonlar/degiskenler.screen'
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
  path: APP_ROUTES.DASHBOARD,
  component: DashboardScreen
})

const dosyalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYALAR,
  component: DosyalarScreen
})

const yeniDosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_DOSYA,
  component: YeniDosyaScreen
})

const firmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.FIRMALAR,
  component: FirmalarScreen
})

const personelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PERSONEL,
  component: PersonelScreen
})

const sablonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SABLONLAR,
  component: SablonlarScreen
})

const degiskenlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DEGISKENLER,
  component: DegiskenlerScreen
})

const komisyonlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYONLAR,
  component: KomisyonlarScreen
})

const komisyonDetayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_DETAY,
  component: KomisyonDetayScreen
})

const komisyonGorevleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_GOREVLERI,
  component: KomisyonGorevleriScreen
})

import { TakipScreen } from './screens/system/TakipScreen'
import { CiktiMerkeziScreen } from './screens/dosya/CiktiMerkezi.screen'
import TaslakYoneticisi from './screens/system/TaslakYoneticisi'

// Dynamic routes
const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TAKIP,
  component: TakipScreen
})

const taslakYonetimiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASLAK_YONETIM,
  component: TaslakYoneticisi
})

const ciktiMerkeziDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CIKTI_MERKEZI_DASHBOARD,
  component: CiktiMerkeziScreen
})

const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.RAPORLAR,
  component: RaporlarScreen
})

const okasKodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OKAS_KOD,
  component: OkasKodScreen
})

const mevzuatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MEVZUAT,
  component: MevzuatScreen
})

const changelogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CHANGELOG,
  component: ChangelogScreen
})

const yardimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YARDIM,
  component: YardimScreen
})

const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IMPORT,
  component: ImportScreen
})

const ayarlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AYARLAR,
  component: AyarlarScreen
})

const temaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TEMA,
  component: TemaScreen
})

const birimlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.BIRIMLER,
  component: BirimlerScreen
})

const ambarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.AMBAR,
  component: AmbarScreen
})

const malzemelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MALZEMELER,
  component: MalzemelerScreen
})

const tasinirkodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.TASINIR_KOD,
  component: TasinirKodScreen
})

const kurumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KURUM,
  component: KurumScreen
})

import {
  FiyatArastirmaKomisyonu,
  MuayeneKabulKomisyonu,
  FiyatArastirmaMuayeneKomisyonu,
  KomisyonAtamaOnayEki,
  MalzemeListesi,
  LuzumMuzekkeresiBelgesi,
  LuzumOnayEki,
  LuzumTeslimTesellum,
  IstekliFirmalar,
  YaklasikMaliyetCetveli,
  PiyasaArastirmaTutanagi,
  DogrudanTeminOnayBelgesi,
  IhaleOnayBelgesi,
  ButceSorgusu,
  HarcamaTalimati,
  HarcamaPusulasi
} from './screens/dosya/SubScreens.screen'

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PROFIL,
  component: ProfilScreen
})

const dosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_DETAY,
  component: DosyaScreen
})

// 1. Komisyon
const fiyatArastirmaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_FIYAT_ARASTIRMA,
  component: FiyatArastirmaKomisyonu
})
const muayeneKabulRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_MUAYENE_KABUL,
  component: MuayeneKabulKomisyonu
})
const fiyatMuayeneRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_FIYAT_MUAYENE,
  component: FiyatArastirmaMuayeneKomisyonu
})
const komisyonOnayEkiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.KOMISYON_ONAY_EKI,
  component: KomisyonAtamaOnayEki
})

// 2. Malzemeler
const malzemeListesiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.MALZEME_LISTESI,
  component: MalzemeListesi
})

// 3. Luzum
const luzumBelgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.LUZUM_BELGESI,
  component: LuzumMuzekkeresiBelgesi
})
const luzumOnayEkiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.LUZUM_ONAY_EKI,
  component: LuzumOnayEki
})
const luzumTeslimTesellumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.LUZUM_TESLIM_TESELLUM,
  component: LuzumTeslimTesellum
})

// 4. Firmalar & Maliyet
const istekliFirmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.ISTEKLI_FIRMALAR,
  component: IstekliFirmalar
})
const yaklasikMaliyetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YAKLASIK_MALIYET,
  component: YaklasikMaliyetCetveli
})
const piyasaArastirmaTutanakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PIYASA_ARASTIRMA_TUTANAGI,
  component: PiyasaArastirmaTutanagi
})

// 5. Onay
const dtOnayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DT_ONAY,
  component: DogrudanTeminOnayBelgesi
})
const ihaleOnayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.IHALE_ONAY,
  component: IhaleOnayBelgesi
})
const butceSorguRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.BUTCE_SORGU,
  component: ButceSorgusu
})

// 6. Harcama
const harcamaTalimatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HARCAMA_TALIMATI,
  component: HarcamaTalimati
})
const harcamaPusulaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.HARCAMA_PUSULASI,
  component: HarcamaPusulasi
})

const ciktiMerkeziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DOSYA_CIKTI_MERKEZI,
  component: CiktiMerkeziScreen
})

const olcubirimleriRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.OLCU_BIRIMLERI,
  component: OlcuBirimleriScreen
})

const yeniMalzemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.YENI_MALZEME,
  component: YeniMalzemeScreen
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dosyalarRoute,
  yeniDosyaRoute,
  firmalarRoute,
  personelRoute,
  sablonlarRoute,
  degiskenlerRoute,
  komisyonlarRoute,
  komisyonDetayRoute,
  komisyonGorevleriRoute,
  takipRoute,
  taslakYonetimiRoute,
  ciktiMerkeziDashboardRoute,
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
