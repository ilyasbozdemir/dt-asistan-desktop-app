import React from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { KurumTabProps } from '../types'

export const IletisimTab: React.FC<KurumTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          İletişim ve Konum Bilgileri
        </h2>
        <p className="text-xs text-slate-500">
          Tebligat ve resmi iletişim için kullanılacak kurum bilgileri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Adres
          </label>
          <Input
            value={data.adres || ''}
            onChange={(e) => onChange('adres', e.target.value)}
            placeholder="Kurum açık adresi"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            İlçe
          </label>
          <Input
            value={data.ilce || ''}
            onChange={(e) => onChange('ilce', e.target.value)}
            placeholder="İlçe"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            İl
          </label>
          <Input
            value={data.il || ''}
            onChange={(e) => onChange('il', e.target.value)}
            placeholder="İl"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Posta Kodu
          </label>
          <Input
            value={data.posta_kodu || ''}
            onChange={(e) => onChange('posta_kodu', e.target.value)}
            placeholder="Posta Kodu"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Telefon
          </label>
          <Input
            value={data.telefon || ''}
            onChange={(e) => onChange('telefon', e.target.value)}
            placeholder="Telefon numarası"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Faks
          </label>
          <Input
            value={data.faks || ''}
            onChange={(e) => onChange('faks', e.target.value)}
            placeholder="Faks numarası"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            E-Posta
          </label>
          <Input
            type="email"
            value={data.eposta || ''}
            onChange={(e) => onChange('eposta', e.target.value)}
            placeholder="Kurumsal e-posta"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            KEP Adresi
          </label>
          <Input
            value={data.kep_adresi || ''}
            onChange={(e) => onChange('kep_adresi', e.target.value)}
            placeholder="KEP Adresi"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Web Sitesi
          </label>
          <Input
            value={data.web_sitesi || ''}
            onChange={(e) => onChange('web_sitesi', e.target.value)}
            placeholder="Web sitesi (Örn: www.kurum.gov.tr)"
            className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
