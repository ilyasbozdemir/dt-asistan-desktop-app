import yaml from 'js-yaml'
import v1alpha1 from './1.0.0-alpha.1.yaml?raw'
import v1alpha2 from './1.0.0-alpha.2.yaml?raw'
import v1alpha3 from './1.0.0-alpha.3.yaml?raw'
import v1alpha4 from './1.0.0-alpha.4.yaml?raw'
import v1alpha5 from './1.0.0-alpha.5.yaml?raw'
import v1alpha6 from './1.0.0-alpha.6.yaml?raw'
import v1alpha7 from './1.0.0-alpha.7.yaml?raw'
import v1alpha8 from './1.0.0-alpha.8.yaml?raw'
import v1alpha9 from './1.0.0-alpha.9.yaml?raw'
import v1alpha10 from './1.0.0-alpha.10.yaml?raw'
import v1alpha11 from './1.0.0-alpha.11.yaml?raw'
import v1alpha12 from './1.0.0-alpha.12.yaml?raw'
import v1alpha13 from './1.0.0-alpha.13.yaml?raw'
import v1alpha16 from './1.0.0-alpha.16.yaml?raw'
import v1alpha17 from './1.0.0-alpha.17.yaml?raw'
import v1alpha18 from './1.0.0-alpha.18.yaml?raw'
import v1alpha19 from './1.0.0-alpha.19.yaml?raw'

// Sıralama schema_version'a göre ascending (küçükten büyüğe) olmalıdır. Sıra şart!
export const manifestsRaw = [v1alpha1, v1alpha2, v1alpha3, v1alpha4, v1alpha5, v1alpha6, v1alpha7, v1alpha8, v1alpha9, v1alpha10, v1alpha11, v1alpha12, v1alpha13, v1alpha16, v1alpha17, v1alpha18, v1alpha19]

export const manifests = manifestsRaw.map(raw => yaml.load(raw) as any)
