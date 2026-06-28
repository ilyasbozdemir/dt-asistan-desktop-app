import { useWorkspaceStore } from '../store/workspaceStore'

export function useDocumentLogger() {
  const { activeDosyaId } = useWorkspaceStore()

  const logDocument = async (belgeAdi: string, dosyaYolu: string = '') => {
    if (!activeDosyaId) return

    try {
      // Önce bu dosya ve bu belge adı için kayıt var mı bakalım
      const existRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi = ?',
        [activeDosyaId, belgeAdi]
      )

      if (existRes.success && existRes.data.length > 0) {
        // Varsa güncelleyelim (yeni dosya yolu, tarih vs.)
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminBelge SET dosya_yolu = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
          [dosyaYolu, existRes.data[0].id]
        )
      } else {
        // Yoksa yeni insert atalım
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO DATA_TeminBelge (temin_dosya_id, belge_adi, dosya_yolu) VALUES (?, ?, ?)',
          [activeDosyaId, belgeAdi, dosyaYolu]
        )
      }
    } catch (error) {
      console.error('Belge loglama hatası:', error)
    }
  }

  return { logDocument }
}
