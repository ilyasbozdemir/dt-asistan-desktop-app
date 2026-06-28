import { PackageSearch, FileText, FileCheck, Users, Compass, CreditCard } from 'lucide-react'
import { APP_ROUTES } from './routeConstants'

export interface ProcessStage {
  name: string
  path: string
  icon: any
  stage: number
}

export const subPagesMapping: ProcessStage[] = [
  { name: 'İhtiyaç Listesi', path: APP_ROUTES.MALZEME_LISTESI, icon: PackageSearch, stage: 1 },
  { name: 'İhtiyaç Talep Formu', path: APP_ROUTES.LUZUM_TALEP_FORMU, icon: FileText, stage: 1 },
  { name: 'Lüzum Müzekkeresi Belgesi', path: APP_ROUTES.LUZUM_BELGESI, icon: FileText, stage: 1 },
  { name: 'Onay Eki', path: APP_ROUTES.LUZUM_ONAY_EKI, icon: FileText, stage: 1 },
  { name: 'Bütçe Sorgusu', path: APP_ROUTES.BUTCE_SORGU, icon: FileCheck, stage: 1 },

  {
    name: 'Fiyat Araştırma Komisyonu',
    path: APP_ROUTES.KOMISYON_FIYAT_ARASTIRMA,
    icon: Users,
    stage: 2
  },
  {
    name: 'Fiyat Araştırma & Muayene',
    path: APP_ROUTES.KOMISYON_FIYAT_MUAYENE,
    icon: Users,
    stage: 2
  },
  { name: 'İstekli Firmalar', path: APP_ROUTES.ISTEKLI_FIRMALAR, icon: Compass, stage: 2 },
  { name: 'Yaklaşık Maliyet', path: APP_ROUTES.YAKLASIK_MALIYET, icon: Compass, stage: 2 },
  {
    name: 'Piyasa Araştırma Tutanağı',
    path: APP_ROUTES.PIYASA_ARASTIRMA_TUTANAGI,
    icon: Compass,
    stage: 2
  },

  { name: 'Komisyon Atama Onay Eki', path: APP_ROUTES.KOMISYON_ONAY_EKI, icon: Users, stage: 3 },
  { name: 'Doğrudan Temin Onay Belgesi', path: APP_ROUTES.DT_ONAY, icon: FileCheck, stage: 3 },
  { name: 'İhale Onay Belgesi', path: APP_ROUTES.IHALE_ONAY, icon: FileCheck, stage: 3 },

  {
    name: 'Muayene Kabul ve Tespit',
    path: APP_ROUTES.KOMISYON_MUAYENE_KABUL,
    icon: Users,
    stage: 4
  },
  { name: 'Teslim Tesellüm', path: APP_ROUTES.LUZUM_TESLIM_TESELLUM, icon: FileText, stage: 4 },
  { name: 'Harcama Talimatı', path: APP_ROUTES.HARCAMA_TALIMATI, icon: CreditCard, stage: 4 },
  { name: 'Harcama Pusulası', path: APP_ROUTES.HARCAMA_PUSULASI, icon: CreditCard, stage: 4 }
]
