import React from 'react'
import DashboardScreen from '../../screens/dashboard/index.screen'
import DosyalarScreen from '../../screens/dosyalar/index.screen'
import FirmalarScreen from '../../screens/firmalar/index.screen'
import PersonelScreen from '../../screens/personel/index.screen'
import { MevzuatScreen } from '../../screens/system/MevzuatScreen'
import ChangelogScreen from '../../screens/system/ChangelogScreen'
import ImportScreen from '../../screens/system/ImportScreen'
import YardimScreen from '../../screens/system/YardimScreen'
import AyarlarScreen from '../../screens/ayarlar/index.screen'
import TemaScreen from '../../screens/ayarlar/TemaScreen'
import BirimlerScreen from '../../screens/birimler/index.screen'
import AmbarScreen from '../../screens/ambar/index.screen'
import MalzemelerScreen from '../../screens/malzemeler/index.screen'
import TasinirKodScreen from '../../screens/tasinirkod/index.screen'
import KurumScreen from '../../screens/kurum/index.screen'
import ProfilScreen from '../../screens/profil/index.screen'
import DosyaScreen from '../../screens/dosya/index.screen'
import SablonlarScreen from '../../screens/sablonlar/index.screen'
import RaporlarScreen from '../../screens/raporlar/index.screen'
import OkasKodScreen from '../../screens/okaskod/index.screen'
import OlcuBirimleriScreen from '../../screens/olcubirimleri/index.screen'
import YeniMalzemeScreen from '../../screens/malzemeler/yeni.screen'
import YeniDosyaScreen from '../../screens/dosyalar/yeni.screen'
import KomisyonlarScreen from '../../screens/komisyonlar/index.screen'
import KomisyonDetayScreen from '../../screens/komisyonlar/detay.screen'
import KomisyonGorevleriScreen from '../../screens/komisyon-gorevleri/index.screen'
import { TakipScreen } from '../../screens/system/TakipScreen'
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
} from '../../screens/dosya/SubScreens.screen'

export const routeComponents: Record<string, React.ComponentType<any>> = {
  '/': DashboardScreen,
  '/dosyalar': DosyalarScreen,
  '/dosyalar/yeni': YeniDosyaScreen,
  '/firmalar': FirmalarScreen,
  '/personel': PersonelScreen,
  '/sablonlar': SablonlarScreen,
  '/komisyonlar': KomisyonlarScreen,
  '/komisyonlar/detay': KomisyonDetayScreen,
  '/komisyon-gorevleri': KomisyonGorevleriScreen,
  '/takip': TakipScreen,
  '/raporlar': RaporlarScreen,
  '/okaskod': OkasKodScreen,
  '/mevzuat': MevzuatScreen,
  '/changelog': ChangelogScreen,
  '/import': ImportScreen,
  '/ayarlar': AyarlarScreen,
  '/tema': TemaScreen,
  '/birimler': BirimlerScreen,
  '/ambar': AmbarScreen,
  '/malzemeler': MalzemelerScreen,
  '/tasinirkod': TasinirKodScreen,
  '/kurum': KurumScreen,
  '/profil': ProfilScreen,
  '/dosya': DosyaScreen,
  '/dosya/komisyon/fiyat-arastirma': FiyatArastirmaKomisyonu,
  '/dosya/komisyon/muayene-kabul': MuayeneKabulKomisyonu,
  '/dosya/komisyon/fiyat-muayene': FiyatArastirmaMuayeneKomisyonu,
  '/dosya/komisyon/onay-eki': KomisyonAtamaOnayEki,
  '/dosya/malzemeler/liste': MalzemeListesi,
  '/dosya/luzum/belge': LuzumMuzekkeresiBelgesi,
  '/dosya/luzum/onay-eki': LuzumOnayEki,
  '/dosya/luzum/teslim-tesellum': LuzumTeslimTesellum,
  '/dosya/firmalar-maliyet/istekliler': IstekliFirmalar,
  '/dosya/firmalar-maliyet/yaklasik': YaklasikMaliyetCetveli,
  '/dosya/firmalar-maliyet/tutanak': PiyasaArastirmaTutanağı,
  '/dosya/onay/dt-onay': DogrudanTeminOnayBelgesi,
  '/dosya/onay/ihale-onay': IhaleOnayBelgesi,
  '/dosya/onay/butce-sorgu': ButceSorgusu,
  '/dosya/harcama/talimat': HarcamaTalimati,
  '/dosya/harcama/pusula': HarcamaPusulasi,
  '/dosya/cikti-merkezi': CiktiMerkeziScreen,
  '/olcubirimleri': OlcuBirimleriScreen,
  '/malzemeler/yeni': YeniMalzemeScreen,
  '/yardim': YardimScreen
}
