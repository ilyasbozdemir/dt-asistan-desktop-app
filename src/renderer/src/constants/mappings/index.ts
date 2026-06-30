export * from './types'
import { ProcessMapping } from './types'
import { IhtiyacListesiMapping } from './ihtiyac-listesi.mapping'
import { IhtiyacTalepFormuMapping } from './ihtiyac-talep-formu.mapping'
import { LuzumMuzekkeresiMapping } from './luzum-muzekkeresi.mapping'
import { LuzumOnayEkiMapping } from './luzum-muzekkeresi-onay-eki.mapping'
import { LuzumTeslimTesellumMapping } from './luzum-muzekkeresi-teslim-tesellum.mapping'
import { SonAlimFiyatCetveliMapping } from './son-alim-fiyat-cetveli.mapping'

export const processMappingRegistry: Record<string, ProcessMapping> = {
  '/dosya/hazirlik-ve-ihtiyac': IhtiyacListesiMapping,
  '/dosya/malzemeler/liste': IhtiyacListesiMapping,
  '/dosya/luzum/talep-formu': IhtiyacTalepFormuMapping,
  '/dosya/luzum/belge': LuzumMuzekkeresiMapping,
  '/dosya/luzum/onay-eki': LuzumOnayEkiMapping,
  '/dosya/luzum/teslim-tesellum': LuzumTeslimTesellumMapping,
  '/dosya/malzemeler/son-alim': SonAlimFiyatCetveliMapping
}

export function getDefaultMappingForProcess(processPath: string): ProcessMapping {
  const cleanPath = processPath.replace(/\.html$/, '').split('/').pop() || ''
  if (cleanPath === 'ihtiyac-listesi' || cleanPath === 'malzeme-hizmet-kalem-listesi') {
    return IhtiyacListesiMapping
  }
  if (cleanPath === 'luzum-muzekkeresi' || cleanPath === 'luzum-muzekkeresi-belgesi') {
    return LuzumMuzekkeresiMapping
  }
  if (cleanPath === 'luzum-muzekkeresi-onay-eki' || cleanPath === 'luzum-onay-eki') {
    return LuzumOnayEkiMapping
  }
  if (cleanPath === 'luzum-muzekkeresi-teslim-tesellum' || cleanPath === 'teslim-tesellum-belgesi') {
    return LuzumTeslimTesellumMapping
  }
  if (cleanPath === 'ihtiyac-talep-formu') {
    return IhtiyacTalepFormuMapping
  }
  if (cleanPath === 'son-alim-fiyat-cetveli') {
    return SonAlimFiyatCetveliMapping
  }
  return processMappingRegistry[processPath] || {}
}
