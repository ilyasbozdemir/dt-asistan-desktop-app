import { PackageSearch, FileText, FileCheck, Users, Compass, CreditCard } from 'lucide-react'

export interface ProcessStage {
  name: string
  path: string
  icon: any
  stage: number
}

export const subPagesMapping: ProcessStage[] = [
  { name: 'İhtiyaç Listesi', path: '/dosya/malzemeler/liste', icon: PackageSearch, stage: 1 },
  { name: 'İhtiyaç Talep Formu', path: '/dosya/luzum/talep-formu', icon: FileText, stage: 1 },
  { name: 'Lüzum Müzekkeresi Belgesi', path: '/dosya/luzum/belge', icon: FileText, stage: 1 },
  { name: 'Onay Eki', path: '/dosya/luzum/onay-eki', icon: FileText, stage: 1 },
  { name: 'Bütçe Sorgusu', path: '/dosya/onay/butce-sorgu', icon: FileCheck, stage: 1 },

  { name: 'Fiyat Araştırma Komisyonu', path: '/dosya/komisyon/fiyat-arastirma', icon: Users, stage: 2 },
  { name: 'Fiyat Araştırma & Muayene', path: '/dosya/komisyon/fiyat-muayene', icon: Users, stage: 2 },
  { name: 'İstekli Firmalar', path: '/dosya/firmalar-maliyet/istekliler', icon: Compass, stage: 2 },
  { name: 'Yaklaşık Maliyet', path: '/dosya/firmalar-maliyet/yaklasik', icon: Compass, stage: 2 },
  { name: 'Piyasa Araştırma Tutanağı', path: '/dosya/firmalar-maliyet/tutanak', icon: Compass, stage: 2 },

  { name: 'Komisyon Atama Onay Eki', path: '/dosya/komisyon/onay-eki', icon: Users, stage: 3 },
  { name: 'Doğrudan Temin Onay Belgesi', path: '/dosya/onay/dt-onay', icon: FileCheck, stage: 3 },
  { name: 'İhale Onay Belgesi', path: '/dosya/onay/ihale-onay', icon: FileCheck, stage: 3 },

  { name: 'Muayene Kabul ve Tespit', path: '/dosya/komisyon/muayene-kabul', icon: Users, stage: 4 },
  { name: 'Teslim Tesellüm', path: '/dosya/luzum/teslim-tesellum', icon: FileText, stage: 4 },
  { name: 'Harcama Talimatı', path: '/dosya/harcama/talimat', icon: CreditCard, stage: 4 },
  { name: 'Harcama Pusulası', path: '/dosya/harcama/pusula', icon: CreditCard, stage: 4 }
]
