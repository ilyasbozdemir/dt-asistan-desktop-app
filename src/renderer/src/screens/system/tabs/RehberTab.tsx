import React, { useState } from 'react'
import { Plus, X, Building2, Briefcase, HardHat, FileText, CheckCircle2 } from 'lucide-react'
import { useSablonlar } from '../../sablonlar/sablonlar.hooks'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

export function RehberTab(): React.JSX.Element {
  const { data: sablonlarData } = useSablonlar()
  const [alimTurleri, setAlimTurleri] = useState([
    {
      id: 'dt-sureci',
      ad: 'Doğrudan Temin İşlem Süreci',
      ikon: 'FileText',
      belgeler: [
        {
          ad: '1- İhtiyacın Tespiti',
          aciklama:
            'Standart form yok, “Lüzum Müzekkeresi” veya “İhtiyaç Raporu” adı altında belge oluşturulur.',
          sablonId: ''
        },
        {
          ad: '2- Onay Belgesi Düzenlenmesi',
          aciklama:
            "İhale onay belgeleri; alım konusu işin nev'i, miktarı, yaklaşık maliyeti ve uygulanacak usulü gösterir. Üzerinde oynama yapılarak kullanılabilir.",
          sablonId: ''
        },
        {
          ad: '3- Görevlendirme Yapılması',
          aciklama: 'Onay belgesi üzerinde veya ayrı bir yazıyla görevlendirme yapılır.',
          sablonId: ''
        },
        {
          ad: '4- Piyasa Fiyat Araştırması Yapılması',
          aciklama: 'Standart formu bulunmaktadır (Örnek 3).',
          sablonId: ''
        },
        {
          ad: '5- Fiyatın Harcama Yetkilisi Tarafından Onaylanması',
          aciklama: 'Piyasa fiyat araştırması tutanağının altına olur verilir.',
          sablonId: ''
        },
        {
          ad: '6- 4734 62/I Maddesine Göre %10 Kontrolü',
          aciklama: 'Kamu İhale Kanunu uyarınca %10 limit kontrolü yapılır.',
          sablonId: ''
        },
        {
          ad: '7- Alımın Yapılması',
          aciklama:
            'Fatura düzenlenmesi, muayene kabul belgeleri ve taşınır işlem fişi (TİF) düzenlenmesi.',
          sablonId: ''
        },
        {
          ad: '8- Ödeme',
          aciklama:
            'Standart formu bulunmaktadır. Ödeme Emri Belgesi düzenlenir ve ekine gerekli belgeler konulur.',
          sablonId: ''
        }
      ]
    },
    {
      id: '1',
      ad: 'Mal Alımı (Örnek)',
      ikon: 'Building2',
      belgeler: [
        { ad: 'Onay Belgesi', sablonId: '' },
        { ad: 'Piyasa Fiyat Araştırması Tutanağı', sablonId: '' },
        { ad: 'Muayene Kabul ve Tespit Komisyonu Tutanağı', sablonId: '' },
        { ad: 'Fatura / e-Arşiv Fatura', sablonId: '' },
        { ad: 'Taşınır İşlem Fişi (TİF)', sablonId: '' }
      ]
    },
    {
      id: '2',
      ad: 'Hizmet Alımı (Örnek)',
      ikon: 'Briefcase',
      belgeler: [
        { ad: 'Onay Belgesi', sablonId: '' },
        { ad: 'Piyasa Fiyat Araştırması Tutanağı', sablonId: '' },
        { ad: 'Hizmet İşleri Kabul Tutanağı', sablonId: '' },
        { ad: 'Fatura / e-Arşiv Fatura', sablonId: '' }
      ]
    },
    {
      id: '3',
      ad: 'Yapım İşi (Örnek)',
      ikon: 'HardHat',
      belgeler: [
        { ad: 'Yaklaşık Maliyet Hesap Cetveli', sablonId: '' },
        { ad: 'Onay Belgesi', sablonId: '' },
        { ad: 'Piyasa Fiyat Araştırması Tutanağı', sablonId: '' },
        { ad: 'Yapım İşleri Kabul Tutanağı', sablonId: '' }
      ]
    }
  ])
  const [yeniAlimTuru, setYeniAlimTuru] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Alım Türlerine Göre Belge Rehberi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Doğrudan temin ile yapılacak alımlarda, alımın türüne göre dosyada bulunması gereken
            asgari belgeler. İlerleyen aşamalarda bu türleri dinamik şablon ID'leri ile
            bağlayabilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Input
            value={yeniAlimTuru}
            onChange={(e) => setYeniAlimTuru(e.target.value)}
            placeholder="Yeni Tür Adı..."
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-9 flex-1 md:w-48"
          />
          <Button
            onClick={() => {
              if (yeniAlimTuru.trim()) {
                setAlimTurleri([
                  ...alimTurleri,
                  {
                    id: Date.now().toString(),
                    ad: yeniAlimTuru.trim(),
                    ikon: 'FileText',
                    belgeler: [
                      { ad: 'Onay Belgesi', sablonId: '' },
                      { ad: 'Piyasa Fiyat Araştırması Tutanağı', sablonId: '' }
                    ]
                  }
                ])
                setYeniAlimTuru('')
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alimTurleri.map((tur) => (
          <div
            key={tur.id}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors relative group"
          >
            <button
              onClick={() => setAlimTurleri(alimTurleri.filter((t) => t.id !== tur.id))}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Bu türü sil"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              {tur.ikon === 'Building2' && <Building2 className="w-6 h-6" />}
              {tur.ikon === 'Briefcase' && <Briefcase className="w-6 h-6" />}
              {tur.ikon === 'HardHat' && <HardHat className="w-6 h-6" />}
              {tur.ikon === 'FileText' && <FileText className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{tur.ad}</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {tur.belgeler.map((belge, idx) => (
                <li
                  key={idx}
                  className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-2.5"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium text-[13px]">{belge.ad}</span>
                      {belge.aciklama && (
                        <span className="text-[11px] text-slate-500 mt-0.5">{belge.aciklama}</span>
                      )}
                    </div>
                  </div>
                  <div className="pl-6">
                    <select
                      value={belge.sablonId}
                      onChange={(e) => {
                        const newTurleri = [...alimTurleri]
                        const turIndex = newTurleri.findIndex((t) => t.id === tur.id)
                        if (turIndex > -1) {
                          newTurleri[turIndex].belgeler[idx].sablonId = e.target.value
                          setAlimTurleri(newTurleri)
                        }
                      }}
                      className="w-full h-7 text-[11px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-500 px-2"
                    >
                      <option value="">Şablon Bağlantısı Yok</option>
                      {sablonlarData?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.ad} ({s.dosya_adi})
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Plus className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 italic text-xs cursor-pointer hover:text-blue-500">
                  Yeni İşlem Sırası Ekle...
                </span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
