import yaml from 'js-yaml'
import v1alpha1 from './1.0.0-alpha.1.yaml?raw'
import v1alpha2 from './1.0.0-alpha.2.yaml?raw'
import v1alpha3 from './1.0.0-alpha.3.yaml?raw'
import v1alpha4 from './1.0.0-alpha.4.yaml?raw'
import v1alpha5 from './1.0.0-alpha.5.yaml?raw'

// Sıralama schema_version'a göre ascending (küçükten büyüğe) olmalıdır. Sıra şart!
export const manifestsRaw = [v1alpha1, v1alpha2, v1alpha3, v1alpha4, v1alpha5]

export const manifests = manifestsRaw.map(raw => yaml.load(raw) as any)
