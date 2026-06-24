import React, { useState } from 'react'
import { SablonListesi } from './components/SablonListesi'
import { SablonEditor } from './components/SablonEditor'
import { PlaceholderYonetimi } from './components/PlaceholderYonetimi'
import { Sablon } from './sablonlar.hooks'
import { cn } from '../../utils/cn'

export default function SablonlarScreen(): React.JSX.Element {
  const [editingSablon, setEditingSablon] = useState<Sablon | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'sablonlar' | 'degiskenler'>('sablonlar')

  const handleEdit = (sablon: Sablon) => {
    setEditingSablon(sablon)
    setIsEditing(true)
  }

  const handleCreate = () => {
    setEditingSablon(null)
    setIsEditing(true)
  }

  const handleBack = () => {
    setEditingSablon(null)
    setIsEditing(false)
  }

  if (isEditing) {
    return <SablonEditor sablon={editingSablon || undefined} onBack={handleBack} />
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6 w-fit mx-auto border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('sablonlar')}
          className={cn(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer',
            activeTab === 'sablonlar'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
          )}
        >
          📄 Şablon Yönetimi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('degiskenler')}
          className={cn(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer',
            activeTab === 'degiskenler'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
          )}
        >
          🔑 Veri Bağlaması (Değişkenler)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sablonlar' && (
          <SablonListesi onEdit={handleEdit} onCreate={handleCreate} />
        )}
        {activeTab === 'degiskenler' && (
          <PlaceholderYonetimi />
        )}
      </div>
    </div>
  )
}
