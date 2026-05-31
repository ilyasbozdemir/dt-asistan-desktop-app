import React from 'react'
import { cn } from '../../utils/cn'

export interface InnerMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  isDivider?: boolean
}

interface InnerMenuProps {
  items: InnerMenuItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function InnerMenu({ items, activeId, onChange, className }: InnerMenuProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5',
        className
      )}
    >
      {items.map((item, idx) => {
        if (item.isDivider) {
          return <div key={`div-${idx}`} className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
        }

        const isActive = activeId === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 rounded-xl transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <span className={cn('shrink-0', isActive ? 'text-primary-foreground' : 'text-slate-400')}>
              {item.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">{item.label}</span>
              {item.description && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                  {item.description}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
