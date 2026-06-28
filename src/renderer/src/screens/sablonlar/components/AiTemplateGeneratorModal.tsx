import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'

interface AiTemplateGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  currentHtml: string
  onApply: (html: string) => void
}

export function AiTemplateGeneratorModal({
  isOpen,
  onClose,
  currentHtml,
  onApply
}: AiTemplateGeneratorModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    try {
      const systemInstruction = `Sen bir uzman HTML, CSS ve Mustache.js şablon geliştiricisisin.
Bana sadece saf HTML kodunu döneceksin. Hiçbir markdown (\`\`\`html) veya fazladan açıklama yazma.
Sadece geçerli HTML kodunu ver, başa veya sona herhangi bir açıklama ekleme.
Mustache.js yer tutucularını (örnek: {{isim}}) uygun yerlerde kullan.
Modern, temiz ve kurumsal bir tasarım yap. Inline CSS veya <style> etiketleri kullanabilirsin. Paged.js özellikleri kullanacaksan (break-inside: avoid vb.) doğru şekilde ekle.
Mevcut şablonu geliştirmeni istiyorsam, mevcut şablonun yapısını bozmadan istenen değişiklikleri yap.

Mevcut Şablon HTML Kodu:
${currentHtml || 'Henüz boş.'}
`
      if (!window.electron) {
        alert('Bu özellik yalnızca masaüstü uygulamasında (Electron) çalışır.')
        setIsGenerating(false)
        return
      }

      const res = await window.electron.ipcRenderer.invoke('ai:generate', {
        prompt: prompt,
        systemInstruction: systemInstruction
      })

      if (res.success && res.data) {
        let cleanHtml = res.data.replace(/^```html\s*/i, '').replace(/\s*```$/i, '')
        onApply(cleanHtml)
        onClose()
        setPrompt('')
      } else {
        alert('Hata: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (e: any) {
      alert('Hata: ' + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ AI Şablon Sihirbazı"
      description="Yapay zeka ile saniyeler içinde yeni bir şablon oluşturun veya mevcut şablonu güncelleyin."
    >
      <div className="flex flex-col space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Örn: Personel izin belgesi şablonu oluştur. Kurum logosu sağ üstte olsun, imza alanı en altta 2 kişilik olsun..."
          className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm resize-none custom-scrollbar focus:ring-2 focus:ring-indigo-500/50"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            İptal
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 flex items-center shadow-md"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'Oluşturuluyor...' : 'Sihri Başlat'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
