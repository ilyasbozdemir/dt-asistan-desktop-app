import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { PersonelAtaModal } from './components/PersonelAtaModal'

export default function KomisyonDetayScreen(): React.JSX.Element {
  const queryClient = useQueryClient()
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const komisyonIdStr = hashParams.get('id')
  const komisyonId = komisyonIdStr ? parseInt(komisyonIdStr, 10) : null

  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false)
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null)

  const {
    data: komisyon,
    isLoading,
    error
  } = useQuery({
    queryKey: ['komisyon_detay', komisyonId],
    queryFn: async () => {
      if (!komisyonId) throw new Error('Komisyon ID bulunamadı')

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE id = ?',
        [komisyonId]
      )
      if (!res.success || res.data.length === 0) throw new Error('Komisyon bulunamadı')

      const komisyonData = res.data[0]

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id as role_id, u.komisyon_id, u.personel_id, u.gorev_adi, u.asil_mi, p.ad_soyad, p.unvan, p.tc_no, p.iban
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         WHERE u.komisyon_id = ?
         ORDER BY u.id ASC`,
        [komisyonId]
      )

      if (membersRes.success) {
        komisyonData.uyeler = membersRes.data
      } else {
        komisyonData.uyeler = []
      }

      return komisyonData
    },
    enabled: !!komisyonId
  })

  if (!komisyonId) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        Geçersiz komisyon kimliği. Lütfen listeye geri dönün.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Yükleniyor...
        </div>
      </div>
    )
  }

  if (error || !komisyon) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500 text-rose-500">
        Bir hata oluştu: {(error as Error)?.message || 'Komisyon yüklenemedi'}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/komisyonlar"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            title="Komisyonlara Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              {komisyon.ad}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Komisyon Üyeleri ve Detayları
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Görevli Personeller
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            Toplam {komisyon.uyeler?.length || 0} Kontenjan
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {komisyon.uyeler && komisyon.uyeler.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {komisyon.uyeler.map((uye: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base text-slate-800 dark:text-slate-200">
                      {uye.personel_id ? (
                        uye.ad_soyad
                      ) : (
                        <span className="text-slate-400 italic">Boş Kontenjan</span>
                      )}
                    </span>
                    {uye.asil_mi === 1 ? (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Asil
                      </span>
                    ) : (
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Yedek
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {uye.personel_id && (
                      <>
                        <span className="bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {uye.unvan}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                      </>
                    )}
                    <span className="text-blue-600 dark:text-blue-400">{uye.gorev_adi}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
                    {!uye.personel_id ? (
                      <Button
                        variant="outline"
                        className="w-full text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => {
                          setAtaRoleId(uye.role_id)
                          setIsAtaModalOpen(true)
                        }}
                      >
                        Personel Ata
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-xs py-2 h-auto rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 bg-white dark:bg-slate-900"
                          onClick={() => {
                            setAtaRoleId(uye.role_id)
                            setIsAtaModalOpen(true)
                          }}
                        >
                          Değiştir
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-xs py-2 h-auto rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white dark:bg-slate-900"
                          onClick={async () => {
                            if (confirm('Personeli bu görevden almak istediğinize emin misiniz?')) {
                              const res = await window.electron.ipcRenderer.invoke(
                                'db:run',
                                'UPDATE TANIM_KomisyonUye SET personel_id = NULL WHERE id = ?',
                                [uye.role_id]
                              )
                              if (res.success) {
                                queryClient.invalidateQueries({
                                  queryKey: ['komisyon_detay', komisyonId]
                                })
                              }
                            }
                          }}
                        >
                          Kaldır
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Bu komisyona henüz üye kontenjanı tanımlanmamış.
              </p>
            </div>
          )}
        </div>
      </div>

      <PersonelAtaModal
        isOpen={isAtaModalOpen}
        onClose={() => {
          setIsAtaModalOpen(false)
          setAtaRoleId(null)
          queryClient.invalidateQueries({ queryKey: ['komisyon_detay', komisyonId] })
        }}
        roleId={ataRoleId}
        komisyonId={komisyonId}
      />
    </div>
  )
}
