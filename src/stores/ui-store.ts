import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type?: 'success' | 'info' | 'error'
}

interface UiState {
  sidebarCollapsed: boolean
  copilotOpen: boolean
  askAiFocused: boolean
  toasts: Toast[]
  selectedOrderIds: Set<string>
  selectedInvoiceIds: Set<string>
  toggleSidebar: () => void
  setCopilotOpen: (open: boolean) => void
  setAskAiFocused: (focused: boolean) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  setSelectedOrders: (ids: Set<string>) => void
  toggleOrderSelection: (id: string) => void
  clearOrderSelection: () => void
  setSelectedInvoices: (ids: Set<string>) => void
  toggleInvoiceSelection: (id: string) => void
  clearInvoiceSelection: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  copilotOpen: false,
  askAiFocused: false,
  toasts: [],
  selectedOrderIds: new Set(),
  selectedInvoiceIds: new Set(),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
  setAskAiFocused: (focused) => set({ askAiFocused: focused }),
  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 2800)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setSelectedOrders: (ids) => set({ selectedOrderIds: ids }),
  toggleOrderSelection: (id) => {
    const next = new Set(get().selectedOrderIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedOrderIds: next })
  },
  clearOrderSelection: () => set({ selectedOrderIds: new Set() }),
  setSelectedInvoices: (ids) => set({ selectedInvoiceIds: ids }),
  toggleInvoiceSelection: (id) => {
    const next = new Set(get().selectedInvoiceIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedInvoiceIds: next })
  },
  clearInvoiceSelection: () => set({ selectedInvoiceIds: new Set() }),
}))

interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface CopilotState {
  messages: CopilotMessage[]
  loading: boolean
  addMessage: (role: 'user' | 'assistant', content: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [],
  loading: false,
  addMessage: (role, content) =>
    set((s) => ({ messages: [...s.messages, { id: `msg-${Date.now()}`, role, content }] })),
  setLoading: (loading) => set({ loading }),
  clearMessages: () => set({ messages: [] }),
}))
