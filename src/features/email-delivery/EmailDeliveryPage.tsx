import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Switch } from '@/components/ui/Switch'
import { Pill } from '@/components/ui/Pill'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { emailRules } from '@/data/mock-email'
import { emailTemplates } from '@/data/mock-email-templates'
import { formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import type { EmailRule, EmailTemplate } from '@/data/models'

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
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [templates, setTemplates] = useState(emailTemplates)
  const [templateForm, setTemplateForm] = useState<Partial<EmailTemplate>>({ configurationType: 'Subject' })
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

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.template) return
    setTemplates([...templates, {
      id: `et-${Date.now()}`,
      name: templateForm.name,
      template: templateForm.template,
      configurationType: templateForm.configurationType as 'Subject' | 'Body',
      modifiedBy: 'harmandeep.singh@chargerlogistics.com',
      modifiedOn: new Date().toISOString(),
    }])
    setTemplateForm({ configurationType: 'Subject' })
    addToast('Email template saved')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Email Delivery"
        subtitle="3,638 delivery rules — configure how invoices reach billing customers."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTemplatesOpen(true)}>Email templates</Button>
            <Button size="sm" onClick={openAdd}><Plus size={14} strokeWidth={1.7} /> Add rule</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search billing customer…" className="w-72" />
        <FilterChip label="Send via" />
        <FilterChip label="Frequency" />
        <span className="ml-auto text-[12px] text-ink-3">3,638 rules</span>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-card shadow-[var(--shadow-rest)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1100px] text-[12px]">
            <thead className="border-b border-line bg-[#FCFCFD]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Billing Customer</th>
                <th className="px-4 py-3">Billing Address</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">To Location Wise</th>
                <th className="px-4 py-3">Send Via</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Send on Day</th>
                <th className="px-4 py-3">Attachment</th>
                <th className="px-4 py-3">Read</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Send Logo</th>
                <th className="px-4 py-3">Modified By</th>
                <th className="px-4 py-3">Modified On</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id} onClick={() => openEdit(rule)} className="cursor-pointer border-b border-line transition-colors hover:bg-[#F7F9FC]">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="text-[11px] font-medium text-accent" onClick={() => openEdit(rule)}>Edit</button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      {rule.billingCustomer}
                      {rule.note && <StickyNote size={14} strokeWidth={1.7} className="text-orange" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-3">{rule.billingAddress}</td>
                  <td className="px-4 py-3">
                    <span>{rule.to[0]}</span>
                    {rule.to.length > 1 && <span className="ml-1 rounded-full bg-black/[0.06] px-1.5 text-[10px]">+{rule.to.length - 1}</span>}
                  </td>
                  <td className="px-4 py-3">{rule.contact ?? '—'}</td>
                  <td className="px-4 py-3">{rule.toLocationWise ?? '—'}</td>
                  <td className="px-4 py-3"><Pill variant={sendViaVariant(rule.sendVia)}>{rule.sendVia}</Pill></td>
                  <td className="px-4 py-3">{rule.frequency}</td>
                  <td className="px-4 py-3">{rule.sendOnDay ?? '—'}</td>
                  <td className="px-4 py-3">{rule.attachment === 'Single attachment in one email' ? 'Single PDF' : 'Per invoice'}</td>
                  <td className="px-4 py-3">{rule.readReceipt ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3">{rule.deliverReceipt ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3">{rule.sendLogo ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3 text-ink-3">{rule.modifiedBy.split('@')[0] ?? rule.modifiedBy}</td>
                  <td className="px-4 py-3 text-ink-3">{formatDate(rule.modifiedOn)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={rule.active} onChange={(v) => toggleActive(rule.id, v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden">
        {filtered.map((rule) => (
          <div
            key={rule.id}
            onClick={() => openEdit(rule)}
            className="cursor-pointer border-b border-line px-4 py-3.5 transition-colors hover:bg-[#F7F9FC]"
          >
            <div className="flex items-center gap-1.5 font-semibold text-ink">
              {rule.billingCustomer}
              {rule.note && <StickyNote size={14} strokeWidth={1.7} className="text-orange" />}
            </div>
            <div className="mt-1 text-[11px] text-ink-3">{rule.billingAddress}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill variant={sendViaVariant(rule.sendVia)}>{rule.sendVia}</Pill>
              <span className="text-[12px]">{rule.frequency}</span>
            </div>
            <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] text-ink-3">{rule.to.join(', ')}</span>
              <Switch checked={rule.active} onChange={(v) => toggleActive(rule.id, v)} />
            </div>
          </div>
        ))}
        </div>
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
          <Field label="Billing Address">
            <input
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
              className="field-input"
              placeholder="Billing address…"
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
          <Field label="To Location Wise">
            <input value={form.toLocationWise ?? ''} onChange={(e) => setForm({ ...form, toLocationWise: e.target.value })} className="field-input" placeholder="Location-based routing…" />
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

      <Modal open={templatesOpen} onClose={() => setTemplatesOpen(false)} title="Email Configuration Template" className="max-w-2xl">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *">
              <input value={templateForm.name ?? ''} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="field-input" placeholder="Enter Name" />
            </Field>
            <Field label="Configuration Type *">
              <select value={templateForm.configurationType} onChange={(e) => setTemplateForm({ ...templateForm, configurationType: e.target.value as 'Subject' | 'Body' })} className="field-input">
                <option value="Subject">Subject</option>
                <option value="Body">Body</option>
              </select>
            </Field>
          </div>
          <Field label="Template *">
            <textarea value={templateForm.template ?? ''} onChange={(e) => setTemplateForm({ ...templateForm, template: e.target.value })} className="field-input min-h-[80px]" placeholder="Enter Template Text — use {Invoice}, {PONO}, {Customer}" />
          </Field>
          <div className="flex justify-end"><Button size="sm" onClick={saveTemplate}>Save</Button></div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-line">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[#FCFCFD]">
                <tr className="text-left text-[11px] font-semibold uppercase text-ink-3">
                  <th className="px-3 py-2">Name</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Modified By</th><th className="px-3 py-2">Modified On</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t border-line hover:bg-black/[0.02]">
                    <td className="px-3 py-2 font-medium">{t.name}</td>
                    <td className="px-3 py-2"><Pill variant="blue">{t.configurationType}</Pill></td>
                    <td className="px-3 py-2 text-ink-3">{t.modifiedBy.split('@')[0]}</td>
                    <td className="px-3 py-2 text-ink-3">{formatDate(t.modifiedOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line px-3 py-2 text-[11px] text-ink-3">Total: {templates.length}</p>
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
