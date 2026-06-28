import React, { useState } from 'react'
import { Plus, X, ListPlus } from 'lucide-react'
import { Input } from '../../../../components/ui/Input'
import { Button } from '../../../../components/ui/Button'

export interface CodeItem {
  code: string
  description: string
}

export interface PresetItem {
  kod: string
  aciklama: string
}

export interface CodeListEditorProps {
  title: string
  description: string
  codes: CodeItem[]
  onChange: (newCodes: CodeItem[]) => void
  placeholderCode?: string
  placeholderDesc?: string
  presets?: PresetItem[]
  presetsLabel?: string
  descOptions?: { value: string; label: string }[]
}

export function CodeListEditor({
  title,
  description,
  codes,
  onChange,
  placeholderCode,
  placeholderDesc,
  presets,
  presetsLabel,
  descOptions
}: CodeListEditorProps): React.JSX.Element {
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleAdd = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newCode.trim()) return
    const trimmedCode = newCode.trim()
    const trimmedDesc = newDesc.trim()

    if (!codes.some((item) => item.code === trimmedCode)) {
      onChange([...codes, { code: trimmedCode, description: trimmedDesc }])
    }
    setNewCode('')
    setNewDesc('')
  }

  const handleLoadPresets = (): void => {
    if (!presets) return
    const existingCodes = new Set(codes.map((c) => c.code))
    const newItems = presets
      .filter((p) => !existingCodes.has(p.kod))
      .map((p) => ({ code: p.kod, description: p.aciklama }))
    if (newItems.length > 0) {
      onChange([...codes, ...newItems])
    }
  }

  const handleRemove = (indexToRemove: number): void => {
    onChange(codes.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-955/20 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-0.5">{title}</h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-500">{description}</p>
        </div>
        {presets && presets.length > 0 && (
          <button
            type="button"
            onClick={handleLoadPresets}
            className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg px-2 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
            title={presetsLabel || 'ABS hazır kodlarını yükle'}
          >
            <ListPlus className="w-3 h-3" />
            {presetsLabel || 'Hazır Kodları Yükle'}
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-4">
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder={placeholderCode || 'Kod...'}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
          />
        </div>
        <div className="sm:col-span-6">
          {descOptions ? (
            <select
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              title={placeholderDesc || 'Seçiniz...'}
            >
              <option value="">{placeholderDesc || 'Seçiniz...'}</option>
              {descOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={placeholderDesc || 'Açıklama (Örn: Mal Alımı)...'}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
            />
          )}
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-8 w-full rounded-lg shrink-0 flex items-center justify-center gap-1 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Ekle
          </Button>
        </div>
      </form>

      {codes.length === 0 ? (
        <div className="text-[10px] text-slate-450 dark:text-slate-500 italic p-3 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
          Kayıtlı kod bulunmuyor.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto p-1 custom-scrollbar">
          {codes.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-750 dark:text-slate-350 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-450 shrink-0 bg-blue-50 dark:bg-blue-955/40 px-1.5 py-0.5 rounded border border-blue-100/30 dark:border-blue-900/20">
                  {item.code}
                </span>
                {item.description && (
                  <span
                    className="text-slate-500 dark:text-slate-400 truncate"
                    title={item.description}
                  >
                    — {item.description}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-all shrink-0 cursor-pointer"
                title="Sil"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
