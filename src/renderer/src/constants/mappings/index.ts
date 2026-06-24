export * from './types'
import { IhtiyacListesiMapping } from './ihtiyac-listesi.mapping'
import { ProcessMapping } from './types'

export const processMappingRegistry: Record<string, ProcessMapping> = {
  '/dosya/malzemeler/liste': IhtiyacListesiMapping
}

export function getDefaultMappingForProcess(processPath: string): ProcessMapping {
  return processMappingRegistry[processPath] || {}
}
