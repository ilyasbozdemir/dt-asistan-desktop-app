import { useState, useEffect } from 'react'

export function useMalzemeListesi(activeDosyaId: number | null) {
  const [items, setItems] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [kalemAdi, setKalemAdi] = useState('')
  const [tasinirKodu, setTasinirKodu] = useState('')
  const [okasKodu, setOkasKodu] = useState('')
  const [tipi, setTipi] = useState('Mal')
  const [birim, setBirim] = useState('Adet')
  const [miktar, setMiktar] = useState(1)
  const [kdvOrani, setKdvOrani] = useState(20)
  const [aciklama, setAciklama] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'new'>('library')
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())
  const [itemMiktarlar, setItemMiktarlar] = useState<Record<number, number>>({})
  const [libSearchQuery, setLibSearchQuery] = useState('')

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMiktar, setEditMiktar] = useState(1)
  const [editBirim, setEditBirim] = useState('')
  const [editKdv, setEditKdv] = useState(20)

  const loadData = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resItems = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )
      const resUnits = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT ad FROM TANIM_OlcuBirimi WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      const resLib = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY kalem_adi ASC'
      )
      if (resItems.success) setItems(resItems.data)
      if (resUnits.success) setUnits(resUnits.data)
      if (resLib.success) setLibraryItems(resLib.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeDosyaId])

  const handleAiAçiklama = async () => {
    const name = kalemAdi.trim() || searchQuery.trim()
    if (!name) return
    setAiLoading(true)
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('ai:generate', {
        prompt: `Bir kamu ihalesinde "${name}" malzemesi veya hizmeti alınacaktır. Bu alım için teknik şartnameye yazılabilecek, genel teknik standartları belirten, ürünün/hizmetin özelliklerini açıklayan kısa ve öz profesyonel bir metin yazar mısın? Sadece metni ver, başına sonuna bir şey ekleme.`
      })
      if (res.success && res.data) {
        setAciklama(res.data)
      } else {
        alert('AI hatası: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('AI Hatası: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSelectSuggestion = (item: any): void => {
    setKalemAdi(item.kalem_adi)
    setTasinirKodu(item.tasinir_kodu || '')
    setOkasKodu(item.okas_kodu || '')
    setTipi(item.tipi || 'Mal')
    setBirim(item.birim || 'Adet')
    setKdvOrani(item.kdv_orani || 20)
    setSearchQuery(item.kalem_adi)
    setShowSuggestions(false)
  }

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const nameToUse = kalemAdi.trim() || searchQuery.trim()
    if (!nameToUse) return

    try {
      const checkRes = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE kalem_adi = ? LIMIT 1',
        [nameToUse]
      )

      if (checkRes.success && checkRes.data.length === 0) {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kalem (kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, aktif_mi, barkod_id)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [nameToUse, tipi, birim, kdvOrani, tasinirKodu || null, okasKodu || null, Date.now().toString()]
        )
      }

      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminKalem 
         (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani, aciklama) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [activeDosyaId, tasinirKodu || null, okasKodu || null, nameToUse, tipi, birim, miktar, kdvOrani, aciklama || null]
      )
      if (res.success) {
        setKalemAdi('')
        setSearchQuery('')
        setTasinirKodu('')
        setOkasKodu('')
        setTipi('Mal')
        setBirim('Adet')
        setMiktar(1)
        setKdvOrani(20)
        setAciklama('')
        setIsAddModalOpen(false)
        loadData()
      } else {
        alert('Kalem eklenirken hata: ' + res.error)
      }
    } catch (err: any) {
      alert('Kalem eklenirken hata: ' + err.message)
    }
  }

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (!confirm('Bu kalemi silmek istediğinize emin misiniz?')) return
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalem WHERE id = ?',
        [id]
      )
      if (res.success) {
        loadData()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStartEdit = (item: any): void => {
    setEditingId(item.id)
    setEditMiktar(item.miktar)
    setEditBirim(item.birim)
    setEditKdv(item.kdv_orani)
  }

  const handleSaveEdit = async (id: number): Promise<void> => {
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminKalem SET miktar = ?, birim = ?, kdv_orani = ? WHERE id = ?',
        [editMiktar, editBirim, editKdv, id]
      )
      if (res.success) {
        setEditingId(null)
        loadData()
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddSelected = async (): Promise<void> => {
    const ids = Array.from(selectedItemIds)
    if (ids.length === 0) return
    try {
      for (const id of ids) {
        const libItem = libraryItems.find((l) => l.id === id)
        if (!libItem) continue
        const mkt = itemMiktarlar[id] ?? 1
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKalem
           (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [activeDosyaId, libItem.tasinir_kodu || null, libItem.okas_kodu || null,
           libItem.kalem_adi, libItem.tipi, libItem.birim, mkt, libItem.kdv_orani]
        )
      }
      setSelectedItemIds(new Set())
      setItemMiktarlar({})
      setLibSearchQuery('')
      setIsAddModalOpen(false)
      loadData()
    } catch (err: any) {
      alert('Eklenirken hata: ' + err.message)
    }
  }

  const filteredSuggestions = searchQuery.trim()
    ? libraryItems.filter(item =>
        item.kalem_adi.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  return {
    items, units, libraryItems, loading,
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
    editingId, setEditingId,
    editMiktar, setEditMiktar,
    editBirim, setEditBirim,
    editKdv, setEditKdv,
    handleAiAçiklama,
    handleSelectSuggestion,
    handleAddItem,
    handleDeleteItem,
    handleStartEdit,
    handleSaveEdit,
    handleAddSelected,
    filteredSuggestions
  }
}
