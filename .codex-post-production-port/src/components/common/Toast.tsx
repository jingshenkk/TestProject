import { createContext, useContext, useState, useCallback, type ComponentType, type ReactNode } from 'react'
import { IconCheck, IconClose, IconAlert, IconInfo } from './Icons'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
  exiting: boolean
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 0

const TOAST_ICON: Record<ToastType, ComponentType<{ size?: number }>> = {
  success: IconCheck,
  error: IconClose,
  warning: IconAlert,
  info: IconInfo,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((type: ToastType, message: string) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, type, message, exiting: false }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 300)
    }, 4000)
  }, [])

  const ctx: ToastContextType = {
    toast: add,
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg),
    warning: (msg) => add('warning', msg),
    info: (msg) => add('info', msg),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => {
          const IconComp = TOAST_ICON[t.type]
          return (
            <div
              key={t.id}
              className={`toast-item is-${t.type}
                ${t.exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
            >
              <span className="toast-icon">
                <IconComp size={18} />
              </span>
              <span className="toast-message">{t.message}</span>
              <button
                onClick={() => {
                  setToasts(prev => prev.map(x => x.id === t.id ? { ...x, exiting: true } : x))
                  setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 300)
                }}
                className="toast-close"
              >
                <IconClose size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
