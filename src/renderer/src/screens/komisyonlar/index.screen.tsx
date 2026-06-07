import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FileSearch
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { KomisyonOlusturModal } from './components/KomisyonOlusturModal'
import { PersonelAtaModal } from './components/PersonelAtaModal'

export default function KomisyonlarScreen(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKomisyonId, setEditingKomisyonId] = useState<number | null>(null)
  
  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false)
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null)
  const [ataKomisyonId, setAtaKomisyonId] = useState<number | null>(null)

  // Oluşturulmuş Komisyonları Çek
  const { data: komisyonlar = [], isLoading: isKomisyonLoading } = useQuery({
    queryKey: ['komisyonlar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE aktif_mi = 1 ORDER BY id DESC'
      )
      if (!res.success) throw new Error(res.error)

      // Get members for all active commissions
      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id as role_id, u.komisyon_id, u.asil_mi, u.personel_id, p.ad_soyad, p.unvan, g.ad as gorev_adi 
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id`
      )
      
      const komisyonlarData = res.data.map((k: any) => ({
        ...k,
        uyeler: membersRes.success ? membersRes.data.filter((m: any) => m.komisyon_id === k.id) : []
      }))

      return komisyonlarData
    }
  })

  const getIconForTur = (ad: string) => {
    if (ad.toLowerCase().includes('fiyat')) return <FileSearch className="w-4 h-4 shrink-0" />
    if (ad.toLowerCase().includes('muayene') || ad.toLowerCase().includes('kabul')) return <CheckCircle2 className="w-4 h-4 shrink-0" />
    return <ShieldCheck className="w-4 h-4 shrink-0" />
  }

  const filteredKomisyonlar = komisyonlar.filter((k: any) => 
    k.ad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Komisyon Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kurum içi görevlendirilecek komisyon asil ve yedek üyelerini buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            onClick={() => {
              setEditingKomisyonId(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" /> Komisyon Oluştur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Komisyon adı veya üye ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>
              <Button variant="outline" className="gap-2 rounded-xl text-slate-600 dark:text-slate-300">
                <Filter className="w-4 h-4" /> Filtrele
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl flex flex-col p-6">
              {isKomisyonLoading ? (
                 <div className="flex-1 flex items-center justify-center text-slate-500">Yükleniyor...</div>
              ) : filteredKomisyonlar.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Kayıtlı Komisyon Bulunamadı
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Henüz bir komisyon tanımı bulunmuyor. Yeni bir komisyon eklemek için yukarıdaki "Komisyon Oluştur" butonunu kullanabilirsiniz.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredKomisyonlar.map((komisyon: any) => (
                    <div key={komisyon.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            {getIconForTur(komisyon.ad)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{komisyon.ad}</h3>
                          </div>
                        </div>
                      </div>
                      {komisyon.uyeler && komisyon.uyeler.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Komisyon Üyeleri</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {komisyon.uyeler.map((uye: any, idx: number) => (
                              <div key={idx} className="flex flex-col p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                    {uye.personel_id ? uye.ad_soyad : <span className="text-slate-400 italic">Boş Kontenjan</span>}
                                  </span>
                                  {uye.asil_mi === 1 ? (
                                    <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">Asil</span>
                                  ) : (
                                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">Yedek</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {uye.personel_id && (
                                    <>
                                      <span>{uye.unvan}</span>
                                      <span className="text-slate-300 dark:text-slate-600">•</span>
                                    </>
                                  )}
                                  <span className="font-medium text-slate-600 dark:text-slate-300">{uye.gorev_adi}</span>
                                </div>
                                {!uye.personel_id ? (
                                  <div className="mt-2">
                                    <Button 
                                      variant="outline" 
                                      className="w-full text-xs py-1 h-auto rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                      onClick={() => {
                                        setAtaRoleId(uye.role_id)
                                        setAtaKomisyonId(uye.komisyon_id)
                                        setIsAtaModalOpen(true)
                                      }}
                                    >
                                      Personel Ata
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="mt-2 flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      className="flex-1 text-xs py-1 h-auto rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                      onClick={() => {
                                        setAtaRoleId(uye.role_id)
                                        setAtaKomisyonId(uye.komisyon_id)
                                        setIsAtaModalOpen(true)
                                      }}
                                    >
                                      Değiştir
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="flex-1 text-xs py-1 h-auto rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                      onClick={async () => {
                                        if(confirm('Personeli bu görevden (komisyondan) almak istediğinize emin misiniz?')) {
                                          const res = await window.electron.ipcRenderer.invoke('db:run', 'UPDATE TANIM_KomisyonUye SET personel_id = NULL WHERE id = ?', [uye.role_id])
                                          if (res.success) {
                                            queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
                                          }
                                        }
                                      }}
                                    >
                                      Kaldır
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 py-3 text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                          Henüz üye atanmamış.
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          className="text-xs py-1.5 h-auto rounded-lg"
                          onClick={() => {
                            setEditingKomisyonId(komisyon.id)
                            setIsModalOpen(true)
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button variant="outline" className="text-xs py-1.5 h-auto rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50">Sil</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <KomisyonOlusturModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingKomisyonId(null)
          }}
          komisyonId={editingKomisyonId}
        />

        <PersonelAtaModal
          isOpen={isAtaModalOpen}
          onClose={() => {
            setIsAtaModalOpen(false)
            setAtaRoleId(null)
            setAtaKomisyonId(null)
          }}
          roleId={ataRoleId}
          komisyonId={ataKomisyonId}
        />
    </div>
  )
}
