import React from 'react'
import { useQuery } from '@tanstack/react-query'

interface Asama {
  id: number
  asama_sira: number
  asama_adi: string
  aciklama: string
  rozet_rengi: string
}

const defaultAsamalar: Asama[] = [
  {
    id: 1,
    asama_sira: 1,
    asama_adi: 'İhtiyaç Tespiti & Başlangıç',
    aciklama:
      'İlgili birim tarafından ihtiyacın belirlendiği ve harcama talimatının hazırlandığı ilk aşamadır.',
    rozet_rengi: 'amber'
  },
  {
    id: 2,
    asama_sira: 2,
    asama_adi: 'Piyasa Fiyat Araştırması',
    aciklama:
      'Firmalardan tekliflerin toplandığı, yaklaşık maliyetin belirlendiği ve alım yapılacak firmanın seçildiği aşamadır.',
    rozet_rengi: 'blue'
  },
  {
    id: 3,
    asama_sira: 3,
    asama_adi: 'Sipariş & Sözleşme',
    aciklama:
      'Harcama yetkilisinden nihai onayın alındığı ve firmaya siparişin geçildiği (gerekiyorsa sözleşmenin imzalandığı) aşamadır.',
    rozet_rengi: 'purple'
  },
  {
    id: 4,
    asama_sira: 4,
    asama_adi: 'Kabul & Ödeme İşlemleri',
    aciklama:
      'Mal veya hizmetin teslim alındığı, kabul komisyonunca onaylandığı ve ödeme evraklarının (ÖEB) Mali Hizmetlere sevk edildiği son aşamadır.',
    rozet_rengi: 'emerald'
  }
]

const fetchAsamalar = async (): Promise<Asama[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
  )
  if (!res.success) throw new Error(res.error)
  if (!res.data || res.data.length === 0) {
    return defaultAsamalar
  }
  return res.data
}

export function AsamalarTab(): React.JSX.Element {
  const { data: asamalar = [], isLoading } = useQuery({
    queryKey: ['asamalar'],
    queryFn: fetchAsamalar
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">İşlem Aşamaları</h2>
        <p className="text-xs text-slate-500">Alım süreçlerindeki varsayılan işlem aşamaları.</p>
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-slate-500">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {asamalar.map((asama) => (
            <div
              key={asama.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-${asama.rozet_rengi}-500 shrink-0`}
                >
                  {asama.asama_sira}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{asama.asama_adi}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{asama.aciklama}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
