import React from 'react'
import { Plus, Check } from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import { Modal } from '../../../../../components/ui/Modal'

export function MalzemeEkleModal({ state }: { state: any }) {
  const {
    libraryItems,
    units,
    kalemAdi, setKalemAdi,
    tasinirKodu, setTasinirKodu,
    okasKodu, setOkasKodu,
    tipi, setTipi,
    birim, setBirim,
    miktar, setMiktar,
    kdvOrani, setKdvOrani,
    aciklama, setAciklama,
    searchQuery, setSearchQuery,
    showSuggestions, setShowSuggestions,
    aiLoading,
    isAddModalOpen, setIsAddModalOpen,
    activeTab, setActiveTab,
    selectedItemIds, setSelectedItemIds,
    itemMiktarlar, setItemMiktarlar,
    libSearchQuery, setLibSearchQuery,
    handleAiAçiklama,
    handleSelectSuggestion,
    handleAddItem,
    handleAddSelected,
    filteredSuggestions
  } = state

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={() => {
        setIsAddModalOpen(false)
        setSelectedItemIds(new Set())
        setItemMiktarlar({})
        setLibSearchQuery('')
      }}
      title="Dosyaya Kalem Ekle"
      description="Kütüphaneden seçin veya yeni bir kalem oluşturun."
    >
      {/* Sekmeler */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={cn(
            'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'library'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          📋 Kütüphaneden Seç
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          className={cn(
            'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'new'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          ✏️ Yeni Kalem
        </button>
      </div>

      {/* SEKME 1: KÜTÜPHANE LİSTESİ */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {/* Arama */}
          <input
            type="text"
            value={libSearchQuery}
            onChange={(e) => setLibSearchQuery(e.target.value)}
            placeholder="Kalem adı, tür veya kod ile arayın..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />

          {/* Seçim sayacı */}
          {selectedItemIds.size > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                {selectedItemIds.size} kalem seçildi
              </span>
              <button
                type="button"
                onClick={() => { setSelectedItemIds(new Set()); setItemMiktarlar({}) }}
                className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Seçimi Temizle
              </button>
            </div>
          )}

          {/* Liste */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
            {libraryItems
              .filter((item: any) =>
                !libSearchQuery.trim() ||
                item.kalem_adi.toLowerCase().includes(libSearchQuery.toLowerCase()) ||
                (item.tasinir_kodu || '').toLowerCase().includes(libSearchQuery.toLowerCase()) ||
                (item.okas_kodu || '').toLowerCase().includes(libSearchQuery.toLowerCase())
              )
              .map((item: any) => {
                const isSelected = selectedItemIds.has(item.id)
                const mkt = itemMiktarlar[item.id] ?? 1
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer',
                      isSelected
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                    onClick={() => {
                      setSelectedItemIds((prev: any) => {
                        const next = new Set(prev)
                        if (next.has(item.id)) next.delete(item.id)
                        else next.add(item.id)
                        return next
                      })
                    }}
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.kalem_adi}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          'text-[9px] font-black uppercase px-1 py-0.5 rounded',
                          item.tipi === 'Mal' && 'bg-blue-100 text-blue-600',
                          item.tipi === 'Hizmet' && 'bg-violet-100 text-violet-600',
                          item.tipi === 'Yapım' && 'bg-amber-100 text-amber-600',
                          item.tipi === 'Danışmanlık' && 'bg-pink-100 text-pink-600'
                        )}>{item.tipi}</span>
                        <span className="text-[9px] text-slate-400">{item.birim} · %{item.kdv_orani} KDV</span>
                        {item.tasinir_kodu && <span className="text-[9px] text-slate-400 font-mono">{item.tasinir_kodu}</span>}
                      </div>
                    </div>

                    {/* Miktar */}
                    {isSelected && (
                      <div
                        className="flex items-center gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setItemMiktarlar((prev: any) => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1) }))}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                        >−</button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{mkt}</span>
                        <button
                          type="button"
                          onClick={() => setItemMiktarlar((prev: any) => ({ ...prev, [item.id]: (prev[item.id] ?? 1) + 1 }))}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                        >+</button>
                      </div>
                    )}
                  </div>
                )
              })}
            {libraryItems.length === 0 && (
              <div className="text-center text-xs text-slate-400 py-8">
                Kütüphanede henüz kayıtlı kalem yok. Yeni Kalem sekmesinden ekleyebilirsiniz.
              </div>
            )}
          </div>

          {/* Ekle butonu */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false)
                setSelectedItemIds(new Set())
                setItemMiktarlar({})
                setLibSearchQuery('')
              }}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              disabled={selectedItemIds.size === 0}
              onClick={handleAddSelected}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {selectedItemIds.size > 0 ? `${selectedItemIds.size} Kalem Ekle` : 'Kalem Seçin'}
            </button>
          </div>
        </div>
      )}

      {/* SEKME 2: YENİ KALEM FORMU */}
      {activeTab === 'new' && (
        <form onSubmit={handleAddItem} className="space-y-3.5">
          {/* Kalem Arama / Autocomplete */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Malzeme / Hizmet Adı
            </label>
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setKalemAdi(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Kütüphaneden arayın veya yeni yazın..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {filteredSuggestions.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs text-slate-700 dark:text-slate-350 font-semibold transition-colors flex flex-col"
                  >
                    <span>{item.kalem_adi}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      Tip: {item.tipi} | KDV: %{item.kdv_orani} {item.tasinir_kodu ? `| Taşınır: ${item.tasinir_kodu}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Taşınır & OKAS Kodları */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Taşınır Kodu</label>
              <input type="text" value={tasinirKodu} onChange={(e) => setTasinirKodu(e.target.value)} placeholder="Örn: 150.01.01"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">OKAS Kodu</label>
              <input type="text" value={okasKodu} onChange={(e) => setOkasKodu(e.target.value)} placeholder="Örn: 30192700"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono" />
            </div>
          </div>

          {/* Türü & Birimi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kalem Türü</label>
              <select value={tipi} onChange={(e) => setTipi(e.target.value)} title="Kalem Türü"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                <option value="Mal">Mal Alımı</option>
                <option value="Hizmet">Hizmet Alımı</option>
                <option value="Yapım">Yapım İşi</option>
                <option value="Danışmanlık">Danışmanlık Alımı</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ölçü Birimi</label>
              <select value={birim} onChange={(e) => setBirim(e.target.value)} title="Ölçü Birimi"
                className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                {units.map((u: any, idx: number) => (<option key={idx} value={u.ad}>{u.ad}</option>))}
              </select>
            </div>
          </div>

          {/* Miktar & KDV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Miktar</label>
              <input type="number" step="0.01" required min="0.01" value={miktar} title="Miktar"
                onChange={(e) => setMiktar(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">KDV Oranı (%)</label>
              <select value={kdvOrani} onChange={(e) => setKdvOrani(parseInt(e.target.value, 10))} title="KDV Oranı"
                className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                <option value="0">%0</option>
                <option value="1">%1</option>
                <option value="10">%10</option>
                <option value="20">%20</option>
              </select>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Açıklama (Opsiyonel)</label>
              <button type="button" onClick={handleAiAçiklama} disabled={(!kalemAdi && !searchQuery) || aiLoading}
                className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {aiLoading ? 'Düşünüyor...' : '✨ AI Önerisi'}
              </button>
            </div>
            <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)}
              placeholder="Özellikler, marka model veya teknik şartlar..." rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
              İptal
            </button>
            <button type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              Kaydet ve Ekle
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
