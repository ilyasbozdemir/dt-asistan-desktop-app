import React from 'react'
import { Package, Plus, Check, X, Edit2, Trash2 } from 'lucide-react'
import { cn } from '../../../../../utils/cn'

export function MalzemeTablosu({ state }: { state: any }) {
  const {
    items,
    units,
    loading,
    setIsAddModalOpen,
    editingId, setEditingId,
    editMiktar, setEditMiktar,
    editBirim, setEditBirim,
    editKdv, setEditKdv,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteItem
  } = state

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          Dosyadaki Kalemler
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">{items.length}</span>
        </h3>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full font-extrabold uppercase">
              {items.reduce((s: number, i: any) => s + i.miktar, 0)} Toplam Miktar
            </span>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Kalem Ekle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-xs">Bu dosyada henüz herhangi bir malzeme/hizmet kalemi eklenmemiş.</p>
          <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki paneli kullanarak ilk kalemi ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3 pl-4">Kalem Adı</th>
                <th className="p-3">Tür</th>
                <th className="p-3 text-center">Miktar</th>
                <th className="p-3">Birim</th>
                <th className="p-3 text-center">KDV (%)</th>
                <th className="p-3 text-right pr-4">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {items.map((item: any) => {
                const isEditing = editingId === item.id

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-3 pl-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.kalem_adi}</div>
                      {(item.tasinir_kodu || item.okas_kodu) && (
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {item.tasinir_kodu && `Taşınır: ${item.tasinir_kodu}`} 
                          {item.tasinir_kodu && item.okas_kodu && ' · '} 
                          {item.okas_kodu && `OKAS: ${item.okas_kodu}`}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase",
                        item.tipi === 'Mal' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                        item.tipi === 'Hizmet' && 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
                        item.tipi === 'Yapım' && 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                        item.tipi === 'Danışmanlık' && 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                      )}>
                        {item.tipi}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editMiktar}
                          onChange={(e) => setEditMiktar(parseFloat(e.target.value) || 1)}
                          className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-center text-xs font-bold"
                        />
                      ) : (
                        <span className="font-black text-slate-750 dark:text-slate-300">{item.miktar}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          value={editBirim}
                          onChange={(e) => setEditBirim(e.target.value)}
                          className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                        >
                          {units.map((u: any, idx: number) => (
                            <option key={idx} value={u.ad}>{u.ad}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{item.birim}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <select
                          value={editKdv}
                          onChange={(e) => setEditKdv(parseInt(e.target.value, 10))}
                          className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                        >
                          <option value="0">%0</option>
                          <option value="1">%1</option>
                          <option value="10">%10</option>
                          <option value="20">%20</option>
                        </select>
                      ) : (
                        <span>%{item.kdv_orani}</span>
                      )}
                    </td>
                    <td className="p-3 text-right pr-4">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Değişiklikleri Kaydet"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer"
                              title="İptal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors cursor-pointer"
                              title="Kalemi Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/10 rounded-lg transition-colors cursor-pointer"
                              title="Kalemi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
