import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Switch } from '@/components/ui/Switch'
import { Pill } from '@/components/ui/Pill'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { emailRules } from '@/data/mock-email'
import { useUiStore } from '@/stores/ui-store'
import type { EmailRule } from '@/data/models'

const emptyRule: Omit<EmailRule, 'id'> = {
  billingCustomer: '',
  billingAddress: '',
  to: [],
  sendVia: 'Email',
  frequency: 'Daily',
  attachment: 'Single attachment in one email',
  readReceipt: false,
  deliverReceipt: false,
  sendLogo: true,
  pdfNameEqualSubject: false,
  pdfNameHasCustomer: true,
  active: true,
  modifiedBy: 'Harmandeep Singh',
  modifiedOn: new Date().toISOString().split('T')[0],
}

export function EmailDeliveryPage() {
  const [search, setSearch] = useState('')
  const [rules, setRules] = useState(emailRules)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EmailRule | null>(null)
  const [form, setForm] = useState(emptyRule)
  const [emailInput, setEmailInput] = useState('')
  const addToast = useUiStore((s) => s.addToast)

  const filtered = rules.filter((r) =>
    r.billingCustomer.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (rule: EmailRule) => {
    setEditing(rule)
    setForm({ ...rule })
    setEmailInput(rule.to.join(', '))
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyRule)
    setEmailInput('')
    setModalOpen(true)
  }

  const save = () => {
    const to = emailInput.split(',').map((e) => e.trim()).filter(Boolean)
    if (editing) {
      setRules(rules.map((r) => r.id === editing.id ? { ...r, ...form, to } : r))
    } else {
      setRules([...rules, { ...form, to, id: `er-${Date.now()}` }])
    }
    setModalOpen(false)
    addToast('Delivery rule saved')
  }

  const toggleActive = (id: string, active: boolean) => {
    setRules(rules.map((r) => r.id === id ? { ...r, active } : r))
  }

  const sendViaVariant = (v: EmailRule['sendVia']) =>
    v === 'Email' ? 'blue' : v === 'Upload' ? 'orange' : 'gray'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Email Delivery</h1>
          <p className="mt-1 text-[13px] text-ink-3">Configure invoice delivery rules for billing customers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Email templates</Button>
          <Button size="sm" onClick={openAdd}><Plus size={14} strokeWidth={1.7} /> Add rule</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search billing customer…" className="w-72" />
        <FilterChip label="Send via" />
        <FilterChip label="Frequency" />
        <span className="ml-auto text-[12px] text-ink-3">3,638 rules</span>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-card shadow-[var(--shadow-rest)]">
        <div className="grid grid-cols-[1.5fr_1.2fr_auto_auto_auto_auto] gap-4 border-b border-line bg-[#FCFCFD] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
          <span>Billing Customer</span>
          <span>Recipients</span>
          <span>Send via</span>
          <span>Frequency</span>
          <span>Attachment</span>
          <span>Active</span>
        </div>
        {filtered.map((rule) => (
          <div
            key={rule.id}
            onClick={() => openEdit(rule)}
            className="grid cursor-pointer grid-cols-[1.5fr_1.2fr_auto_auto_auto_auto] items-center gap-4 border-b border-line px-4 py-3.5 transition-colors hover:bg-[#F7F9FC]"
          >
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                {rule.billingCustomer}
                {rule.note && <StickyNote size={14} strokeWidth={1.7} className="text-orange" />}
              </div>
              <div className="text-[11px] text-ink-3">{rule.billingAddress}</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px]">{rule.to[0]}</span>
              {rule.to.length > 1 && (
                <span className="rounded-full bg-black/[0.06] px-1.5 text-[10px] text-ink-3">+{rule.to.length - 1}</span>
              )}
            </div>
            <Pill variant={sendViaVariant(rule.sendVia)}>{rule.sendVia}</Pill>
            <span className="text-[12px]">{rule.frequency}{rule.sendOnDay ? ` · ${rule.sendOnDay}` : ''}</span>
            <span className="text-[12px] text-ink-2">{rule.attachment === 'Single attachment in one email' ? 'Single PDF' : 'Per invoice'}</span>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch checked={rule.active} onChange={(v) => toggleActive(rule.id, v)} />
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit delivery rule' : 'Add delivery rule'}
        className="max-w-xl"
        footer={<ModalFooter onCancel={() => setModalOpen(false)} onSave={save} saveLabel="Save rule" />}
      >
        <div className="space-y-4">
          <Field label="Bill Customer *">
            <input
              value={form.billingCustomer}
              onChange={(e) => setForm({ ...form, billingCustomer: e.target.value })}
              className="field-input"
              placeholder="Search customer…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Send via *">
              <select value={form.sendVia} onChange={(e) => setForm({ ...form, sendVia: e.target.value as EmailRule['sendVia'] })} className="field-input">
                <option>Email</option>
                <option>Upload</option>
                <option>Do not send</option>
              </select>
            </Field>
            <Field label="Frequency *">
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as EmailRule['frequency'] })} className="field-input">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </Field>
          </div>
          {form.frequency === 'Weekly' && (
            <Field label="To Email Day">
              <select value={form.sendOnDay ?? ''} onChange={(e) => setForm({ ...form, sendOnDay: e.target.value })} className="field-input">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
          )}
          <Field label="Attachment *">
            <select value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value as EmailRule['attachment'] })} className="field-input">
              <option>Single attachment in one email</option>
              <option>One email per invoice</option>
            </select>
          </Field>
          <Field label="To (comma-separated)">
            <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="field-input" placeholder="email@company.com, ap@company.com" />
          </Field>
          <Field label="Contact">
            <input value={form.contact ?? ''} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="field-input" />
          </Field>
          <Field label="Note">
            <textarea value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="field-input min-h-[80px]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['readReceipt', 'Read Receipt'],
              ['deliverReceipt', 'Deliver Receipt'],
              ['sendLogo', 'Send Logo'],
              ['pdfNameEqualSubject', 'PDF Name Equal Subject'],
              ['pdfNameHasCustomer', 'PDF Name Has Customer'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <style>{`.field-input { width: 100%; border-radius: 10px; border: 1px solid var(--line); padding: 8px 12px; font-size: 13px; outline: none; } .field-input:focus { box-shadow: 0 0 0 3px var(--accent-soft); }`}</style>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-ink-2">{label}</label>
      {children}
    </div>
  )
}
