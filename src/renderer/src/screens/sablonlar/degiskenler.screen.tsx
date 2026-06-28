import React, { useState } from 'react'
import { PlaceholderYonetimi } from './components/PlaceholderYonetimi'
import SablonlarScreen from './index.screen'
import { Key, FileText } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function DegiskenlerScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'sablons' | 'placeholders'>('sablons')

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300 p-6">
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sablons')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'sablons'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
        >
          <FileText className="w-4 h-4" />
          Şablon Yönetimi
        </button>
        <button
          onClick={() => setActiveTab('placeholders')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'placeholders'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
        >
          <Key className="w-4 h-4" />
          Değişkenler & Bağlamalar
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'sablons' && <SablonlarScreen />}
        {activeTab === 'placeholders' && <PlaceholderYonetimi />}
      </div>
    </div>
  )
}
