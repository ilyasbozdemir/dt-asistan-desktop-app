import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { PageWrapper } from './components/layout/PageWrapper'
import DashboardScreen from './screens/dashboard/index.screen'
import DosyalarScreen from './screens/dosyalar/index.screen'
import FirmalarScreen from './screens/firmalar/index.screen'
import PersonelScreen from './screens/personel/index.screen'
import { MevzuatScreen } from './screens/system/MevzuatScreen'
import ChangelogScreen from './screens/system/ChangelogScreen'
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

// Placeholder routes
const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/takip',
  component: () => (
    <div className="p-4 text-slate-500">Takip & Durum ekranı yapım aşamasında...</div>
  )
})

const belgelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/belgeler',
  component: () => (
    <div className="p-4 text-slate-500">Belgeler & Formlar ekranı yapım aşamasında...</div>
  )
})

const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/raporlar',
  component: () => <div className="p-4 text-slate-500">Raporlar ekranı yapım aşamasında...</div>
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  dosyalarRoute,
  firmalarRoute,
  personelRoute,
  sablonlarRoute,
  takipRoute,
  belgelerRoute,
  raporlarRoute,
  mevzuatRoute,
  changelogRoute,
  ayarlarRoute,
  temaRoute,
  birimlerRoute,
  ambarRoute,
  malzemelerRoute,
  tasinirkodRoute,
  kurumRoute,
  profilRoute,
  dosyaRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
