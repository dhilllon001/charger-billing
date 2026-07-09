import { Check, X, Clock, AlertTriangle } from 'lucide-react'
import type { OrderWorkflow, WorkflowStageStatus } from '@/data/models'
import { cn } from '@/lib/cn'

const stages = [
  { key: 'rateValidation' as const, label: 'Rate Validation' },
  { key: 'operationValidation' as const, label: 'Operation Validation' },
  { key: 'podPending' as const, label: 'POD Pending' },
  { key: 'autoInvoicing' as const, label: 'Auto Invoicing' },
  { key: 'invoiceDelivery' as const, label: 'Invoice Delivery' },
  { key: 'accountingSync' as const, label: 'Accounting Sync' },
]

function StageIcon({ status, size = 14 }: { status: WorkflowStageStatus; size?: number }) {
  if (status === 'passed') return <Check size={size} strokeWidth={2} className="text-green" />
  if (status === 'failed') return <X size={size} strokeWidth={2} className="text-red" />
  if (status === 'warning') return <AlertTriangle size={size} strokeWidth={1.7} className="text-orange" />
  return <Clock size={size} strokeWidth={1.7} className="text-accent" />
}

function stageSubtext(key: typeof stages[number]['key'], step: OrderWorkflow[typeof key]): string {
  if (key === 'rateValidation' || key === 'operationValidation' || key === 'podPending') {
    const s = step as { checksPassed: number; checksTotal: number; detail?: string; status: WorkflowStageStatus }
    if (s.status === 'warning' && s.detail) return s.detail
    if (s.status === 'failed') return `${s.checksPassed} of ${s.checksTotal} checks passed`
    return `${s.checksPassed} checks passed`
  }
  const s = step as { label: string; status: WorkflowStageStatus }
  return s.status === 'waiting' || s.status === 'pending' ? `Waiting · ${s.label}` : s.label
}

export function WorkflowBar({ workflow, activeKey }: { workflow: OrderWorkflow; activeKey?: string }) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line bg-card p-3 shadow-[var(--shadow-rest)]">
      <div className="flex min-w-[720px] gap-0">
        {stages.map((s, i) => {
          const step = workflow[s.key]
          const active = activeKey === s.key
          const sub = stageSubtext(s.key, step)
          return (
            <div key={s.key} className="relative flex flex-1 flex-col items-center px-2">
              {i > 0 && (
                <div className="absolute left-0 top-5 h-px w-full -translate-x-1/2 bg-line" style={{ width: '100%', left: 0 }} />
              )}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white',
                  step.status === 'passed' && 'border-green bg-green-soft',
                  step.status === 'failed' && 'border-red bg-red-soft',
                  step.status === 'warning' && 'border-orange bg-orange-soft',
                  (step.status === 'pending' || step.status === 'waiting') && 'border-accent bg-accent-soft',
                  active && 'ring-2 ring-accent ring-offset-2'
                )}
              >
                <StageIcon status={step.status} />
              </div>
              <p className="mt-2 text-center text-[11px] font-semibold text-ink">{s.label}</p>
              <p className="mt-0.5 text-center text-[10px] leading-tight text-ink-3">{sub}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function WorkflowStepper({ workflow }: { workflow: OrderWorkflow; compact?: boolean }) {
  return <WorkflowBar workflow={workflow} />
}

export function WorkflowDots({ workflow }: { workflow: OrderWorkflow }) {
  const dots = [
    workflow.rateValidation.status,
    workflow.operationValidation.status,
    workflow.podPending.status,
    workflow.autoInvoicing.status,
    workflow.invoiceDelivery.status,
    workflow.accountingSync.status,
  ]
  return (
    <div className="flex gap-0.5">
      {dots.map((s, i) => (
        <span
          key={i}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full',
            s === 'passed' && 'bg-green-soft',
            s === 'failed' && 'bg-red-soft',
            s === 'warning' && 'bg-orange-soft',
            (s === 'pending' || s === 'waiting') && 'bg-accent-soft'
          )}
        >
          <StageIcon status={s} size={10} />
        </span>
      ))}
    </div>
  )
}
