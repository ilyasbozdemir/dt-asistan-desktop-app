import React, { useState } from 'react'
import { PackageSearch, Plus, Trash2, Edit2, FileText, Tag, Filter, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

interface MalzemeMock {
  id: number
  pozNo: string
  ad: string
  birim: string
  kategori: string
}

export default function MalzemelerScreen(): React.JSX.Element {
  const [malzemeler, setMalzemeler] = useState<MalzemeMock[]>([
    { id: 1, pozNo: '03.01.01', ad: 'A4 Fotokopi Kağıdı (80 gr/m2) Beyaz', birim: 'Kutu', kategori: 'Kırtasiye' },
    { id: 2, pozNo: '04.250/1', ad: 'Portlant Çimento (CEM I 42,5 R)', birim: 'Torba (50kg)', kategori: 'İnşaat Malzemesi' },
    { id: 3, pozNo: 'HIZ-005', ad: 'Klima Cihazı Yıllık Bakım ve Onarım Hizmeti', birim: 'Adet/Yıl', kategori: 'Hizmet Alımı' },
    { id: 4, pozNo: '03.05.02', ad: 'Plastik Klasör Dar Tip A4 Mavi', birim: 'Adet', kategori: 'Kırtasiye' },
    { id: 5, pozNo: '04.012', ad: 'Hazır Beton (C 25/30 Transmikserle Teslim)', birim: 'm3', kategori: 'İnşaat Malzemesi' }
  ])

  const [pozNo, setPozNo] = useState('')
  const [ad, setAd] = useState('')
  const [birim, setBirim] = useState('Adet')
  const [kategori, setKategori] = useState('Kırtasiye')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAdd = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!ad.trim()) return
    const newMalzeme: MalzemeMock = {
      id: Date.now(),
      pozNo: pozNo.trim() || 'POZ-YOK',
      ad: ad.trim(),
      birim: birim.trim(),
      kategori: kategori
    }
    setMalzemeler([...malzemeler, newMalzeme])
    setPozNo('')
    setAd('')
    setIsModalOpen(false)
    alert('Yeni malzeme kaydı eklendi (Mock).')
  }

  const handleDelete = (id: number): void => {
    if (confirm('Bu malzeme kaydını silmek istediğinize emin misiniz?')) {
      setMalzemeler(malzemeler.filter((m) => m.id !== id))
    }
  }

  const filtered = malzemeler.filter(
    (m) =>
      m.ad.toLowerCase().includes(search.toLowerCase()) ||
      m.pozNo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <PackageSearch className="w-8 h-8 text-blue-605" />
            Malzeme & Hizmet Tanımları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Yaklaşık maliyet hesaplarında ve tekliflerde kullanılan ortak malzeme, hizmet ve poz tanımlarını yönetin.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-6 hidden sm:block">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{malzemeler.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kayıtlı Kalem</div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Malzeme/Hizmet
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kayıtlı Malzeme & Hizmet</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{malzemeler.length} Kalem</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Poz Numaralı Kayıtlar</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {malzemeler.filter(m => m.pozNo !== 'POZ-YOK' && !m.pozNo.startsWith('HIZ')).length} Kalem
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Ana Kategori Sayısı</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {new Set(malzemeler.map(m => m.kategori)).size} Kategori
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">
            Malzeme & Hizmet Havuzu
          </h3>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kod veya malzeme ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <PackageSearch className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Malzeme Bulunamadı</h3>
              <p className="text-xs mt-1 text-slate-500">
                Arama kriterlerinize uygun malzeme kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    title="Sil"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-2 pr-12">
                  <span className="font-mono font-bold text-[10px] text-blue-606 dark:text-blue-450 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                    {item.pozNo}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    {item.kategori}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 leading-snug line-clamp-3">
                  {item.ad}
                </h4>

                <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Birim: {item.birim}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Malzeme / Hizmet Tanımla"
        description="Yaklaşık maliyet hesaplarında kullanılacak kalemleri kaydedin."
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">Poz No / Stok Kodu</label>
            <Input
              value={pozNo}
              onChange={(e) => setPozNo(e.target.value)}
              placeholder="Örn: 04.250/1"
              className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">Malzeme / Hizmet Adı <span className="text-red-500">*</span></label>
            <Input
              required
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Malzeme açıklamasını yazın"
              className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">Ölçü Birimi</label>
              <select
                value={birim}
                onChange={(e) => setBirim(e.target.value)}
                title="Birim Seçin"
                className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Adet">Adet</option>
                <option value="Kutu">Kutu</option>
                <option value="Torba (50kg)">Torba (50kg)</option>
                <option value="m3">m3</option>
                <option value="kg">kg</option>
                <option value="Metre">Metre</option>
                <option value="Saat">Saat</option>
                <option value="Gün">Gün</option>
                <option value="Adet/Yıl">Adet/Yıl</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-455 mb-1.5">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                title="Kategori Seçin"
                className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Kırtasiye">Kırtasiye</option>
                <option value="İnşaat Malzemesi">İnşaat Malzemesi</option>
                <option value="Hizmet Alımı">Hizmet Alımı</option>
                <option value="Bilişim & Teknoloji">Bilişim & Teknoloji</option>
                <option value="Elektrik & Tesisat">Elektrik & Tesisat</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              Malzeme Kaydını Ekle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
