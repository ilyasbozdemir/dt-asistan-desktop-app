import { Plus, LayoutTemplate, History, Edit, Calendar } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useSablonlar, Sablon } from '../sablonlar.hooks'

export function SablonListesi({ onEdit, onCreate }: { onEdit: (s: Sablon) => void, onCreate: () => void }) {
  const { data: sablonlar, isLoading } = useSablonlar()

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-purple-500" />
            Şablon Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sistemdeki tüm şablonları yönetin, versiyonları görün veya yeni şablon oluşturun.
          </p>
        </div>
        <Button onClick={onCreate} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 px-4 shadow-md">
          <Plus className="w-4 h-4" />
          Yeni Şablon
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Yükleniyor...</div>
        ) : sablonlar?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <LayoutTemplate className="w-12 h-12 mb-2 text-slate-300" />
            <p>Henüz şablon bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sablonlar?.map((sablon) => (
              <div key={sablon.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{sablon.ad}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                      {sablon.dosya_adi}.{sablon.dosya_turu}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-1 rounded">
                    v{sablon.versiyon}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4">
                  {sablon.aciklama || 'Açıklama yok'}
                </p>

                {(sablon.created_at || sablon.updated_at) && (
                  <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Son Güncelleme</span>
                      <span className="line-clamp-1 leading-relaxed">
                        {new Date(sablon.updated_at || sablon.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                   <Button onClick={() => onEdit(sablon)} variant="outline" className="w-full justify-center text-xs border-slate-200 dark:border-slate-700">
                     <Edit className="w-3.5 h-3.5 mr-2" /> Düzenle
                   </Button>
                   <Button variant="ghost" className="w-full justify-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                     <History className="w-3.5 h-3.5 mr-2" /> Geçmişi Gör
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
