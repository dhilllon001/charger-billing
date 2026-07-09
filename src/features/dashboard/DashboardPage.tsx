import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileCheck, Clock, DollarSign, AlertTriangle, Sparkles, Download, ArrowRight,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { useUiStore } from '@/stores/ui-store'
import { activities, weeklyInvoiced } from '@/data/mock-dashboard'
import { getGreeting, formatCurrency, formatRelativeTime } from '@/lib/format'

const kpis = [
  { label: 'Ready to invoice', value: '92', delta: '↑ 12%', deltaType: 'up' as const, icon: FileCheck, color: '#1FA85B' },
  { label: 'Pending validation', value: '36', delta: '↓ 4', deltaType: 'down' as const, icon: Clock, color: '#C77400' },
  { label: 'Invoiced this month', value: formatCurrency(1842500), delta: '↑ 8.2%', deltaType: 'up' as const, icon: DollarSign, color: '#0071E3' },
  { label: 'Overdue receivables', value: formatCurrency(284920), delta: '18 invoices', deltaType: 'neutral' as const, icon: AlertTriangle, color: '#D93025' },
]

const pipeline = [
  { stage: 'all', label: 'All open', count: 61, pct: 100 },
  { stage: 'rate_validated', label: 'Rate validated', count: 12, pct: 65 },
  { stage: 'ops_validated', label: 'Ops validated', count: 8, pct: 50 },
  { stage: 'pod_verified', label: 'POD verified', count: 10, pct: 38 },
  { stage: 'ready', label: 'Ready', count: 15, pct: 22 },
]

const insights = [
  { type: 'warning' as const, text: 'Rate variance vs contract on 23 orders', action: 'Review', link: '/batch-invoicing' },
  { type: 'success' as const, text: 'POD auto-matched for 47 Labatt orders', action: 'Approve all', link: '/batch-invoicing' },
  { type: 'ai' as const, text: '3 rate cards expiring within 10 days', action: '→ Rates', link: '/rates-fuel' },
  { type: 'ai' as const, text: 'Duplicate invoice prevented for CL-2026042', action: 'View', link: '/invoiced' },
]

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

export function DashboardPage() {
  const setCopilotOpen = useUiStore((s) => s.setCopilotOpen)
  const addToast = useUiStore((s) => s.addToast)
  const maxAmount = Math.max(...weeklyInvoiced.map((w) => w.amount))

  return (
    <motion.div {...pageVariants} className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em] text-ink">{getGreeting('Harmandeep')}</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm"><Download size={14} strokeWidth={1.7} /> Export report</Button>
          <Button variant="ai" size="sm" onClick={() => setCopilotOpen(true)}>
            <Sparkles size={14} strokeWidth={1.7} /> AI Copilot
          </Button>
        </div>
      </div>

      <div className="ai-gradient-border p-5">
        <div className="relative flex items-center justify-between gap-4">
          <p className="text-[14px] leading-relaxed text-ink">
            <strong>92 orders are ready to invoice</strong> — rate, ops and POD checks passed. Generating now releases <strong>{formatCurrency(412807)}</strong>.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" onClick={() => addToast('Opening batch with ready orders')}>Review & generate</Button>
            <Button variant="ghost" size="sm">Dismiss</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} hover className="p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
              <kpi.icon size={14} strokeWidth={1.7} style={{ color: kpi.color }} />
              {kpi.label}
            </div>
            <div className="mt-2 text-[28px] font-bold tabular-nums text-ink">{kpi.value}</div>
            <Pill
              variant={kpi.deltaType === 'up' ? 'green' : kpi.deltaType === 'down' ? 'red' : 'gray'}
              dot={false}
              className="mt-2"
            >
              {kpi.deltaType === 'up' && <TrendingUp size={12} strokeWidth={1.7} />}
              {kpi.deltaType === 'down' && <TrendingDown size={12} strokeWidth={1.7} />}
              {kpi.deltaType === 'neutral' && <Minus size={12} strokeWidth={1.7} />}
              {kpi.delta}
            </Pill>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 text-[14.5px] font-bold">Invoicing pipeline</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pipeline.map((p) => (
              <Link
                key={p.stage}
                to={`/batch-invoicing?stage=${p.stage}`}
                className="rounded-xl border border-line p-3 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="text-[20px] font-bold tabular-nums">{p.count}</div>
                <div className="text-[11px] text-ink-3">{p.label}</div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-[14.5px] font-bold">AI insights</h2>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-black/[0.02] p-3">
                <span className={ins.type === 'ai' ? 'ai-gradient flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] text-white' : ''}>
                  {ins.type !== 'ai' && (
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${ins.type === 'warning' ? 'bg-orange-soft text-orange' : 'bg-green-soft text-green'}`}>
                      {ins.type === 'warning' ? '!' : '✓'}
                    </span>
                  )}
                  {ins.type === 'ai' && '✦'}
                </span>
                <div className="flex-1">
                  <p className="text-[12.5px] text-ink">{ins.text}</p>
                  <Link to={ins.link} className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium text-accent">
                    {ins.action} <ArrowRight size={12} strokeWidth={1.7} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-[14.5px] font-bold">Invoiced amount — last 8 weeks</h2>
        <div className="flex items-end gap-3 h-40">
          {weeklyInvoiced.map((w, i) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-lg transition-all ${i === weeklyInvoiced.length - 1 ? 'bg-accent' : 'bg-black/[0.08]'}`}
                style={{ height: `${(w.amount / maxAmount) * 100}%`, minHeight: 8 }}
              />
              <span className="text-[10px] text-ink-3">{w.week.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-[14.5px] font-bold">Recent activity</h2>
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
              <p className="flex-1 text-[13px]">
                <strong>{a.user}</strong> {a.action}
              </p>
              <span className="text-[12px] text-ink-3">{formatRelativeTime(a.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
