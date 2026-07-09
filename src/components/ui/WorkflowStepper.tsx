import type { OrderWorkflow, WorkflowStageStatus } from '@/data/models'
import { CheckCircle2, Clock, List, MoreVertical, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

export const WORKFLOW_STAGES = [
  { key: 'rateValidation' as const, label: 'Rate Validation', short: 'Rate' },
  { key: 'operationValidation' as const, label: 'Operation Validation', short: 'Ops' },
  { key: 'podPending' as const, label: 'POD Pending', short: 'POD' },
  { key: 'autoInvoicing' as const, label: 'Auto Invoicing', short: 'Invoice' },
  { key: 'invoiceDelivery' as const, label: 'Invoice Delivery', short: 'Delivery' },
  { key: 'accountingSync' as const, label: 'Accounting Sync', short: 'AS' },
]

export type CurrentWorkflowStage = {
  key: (typeof WORKFLOW_STAGES)[number]['key']
  label: string
  short: string
  status: WorkflowStageStatus
  detail: string
  index: number
  total: number
}

function stageDetail(key: (typeof WORKFLOW_STAGES)[number]['key'], step: OrderWorkflow[typeof key]): string {
  if (key === 'rateValidation' || key === 'operationValidation' || key === 'podPending') {
    const s = step as { checksPassed: number; checksTotal: number; detail?: string; status: WorkflowStageStatus }
    if (s.status === 'warning' && s.detail) return s.detail
    if (s.status === 'failed') return `${s.checksPassed}/${s.checksTotal} checks`
    if (s.status === 'passed') return `${s.checksPassed} checks passed`
    return `${s.checksPassed}/${s.checksTotal} checks`
  }
  const s = step as { label: string; status: WorkflowStageStatus }
  if (s.status === 'waiting') return s.label === 'Waiting' ? 'Waiting' : s.label
  if (s.status === 'pending') return 'Pending'
  if (s.status === 'passed') return 'Complete'
  return s.label
}

function isChecksStage(key: (typeof WORKFLOW_STAGES)[number]['key']) {
  return key === 'rateValidation' || key === 'operationValidation' || key === 'podPending'
}

export function getCurrentWorkflowStage(workflow: OrderWorkflow): CurrentWorkflowStage {
  for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
    const s = WORKFLOW_STAGES[i]
    const step = workflow[s.key]
    if (step.status !== 'passed') {
      return {
        key: s.key,
        label: s.label,
        short: s.short,
        status: step.status,
        detail: stageDetail(s.key, step),
        index: i,
        total: WORKFLOW_STAGES.length,
      }
    }
  }
  const last = WORKFLOW_STAGES[WORKFLOW_STAGES.length - 1]
  const step = workflow[last.key]
  return {
    key: last.key,
    label: last.label,
    short: last.short,
    status: step.status,
    detail: stageDetail(last.key, step),
    index: WORKFLOW_STAGES.length - 1,
    total: WORKFLOW_STAGES.length,
  }
}

const statusStyles: Record<WorkflowStageStatus, { badge: string; bar: string; text: string }> = {
  passed: { badge: 'sr-stage--passed', bar: 'sr-stage-bar--passed', text: 'var(--sr-positive)' },
  failed: { badge: 'sr-stage--failed', bar: 'sr-stage-bar--failed', text: 'var(--sr-negative)' },
  warning: { badge: 'sr-stage--warning', bar: 'sr-stage-bar--warning', text: 'var(--sr-orange, #C77400)' },
  pending: { badge: 'sr-stage--active', bar: 'sr-stage-bar--active', text: 'var(--sr-action)' },
  waiting: { badge: 'sr-stage--waiting', bar: 'sr-stage-bar--waiting', text: 'var(--sr-text-meta)' },
}

/** Single current-stage badge for tables */
export function WorkflowStageBadge({ workflow, compact }: { workflow: OrderWorkflow; compact?: boolean }) {
  const current = getCurrentWorkflowStage(workflow)
  const style = statusStyles[current.status]

  return (
    <span className={cn('sr-stage-badge', style.badge)}>
      <span className="sr-stage-badge__dot" />
      <span className="sr-stage-badge__label">{compact ? current.short : current.label}</span>
    </span>
  )
}

/** Compact progress strip — current stage only, no per-stage icons */
export function WorkflowStageCompact({ workflow }: { workflow: OrderWorkflow }) {
  const current = getCurrentWorkflowStage(workflow)
  const style = statusStyles[current.status]

  return (
    <div className="sr-stage-compact">
      <div className="sr-stage-compact__bar" role="progressbar" aria-valuenow={current.index + 1} aria-valuemin={1} aria-valuemax={current.total}>
        {WORKFLOW_STAGES.map((s, i) => {
          const step = workflow[s.key]
          const isCurrent = i === current.index
          const isPast = step.status === 'passed'
          return (
            <span
              key={s.key}
              className={cn(
                'sr-stage-compact__seg',
                isPast && 'is-past',
                isCurrent && 'is-current',
                isCurrent && style.bar
              )}
              title={s.label}
            />
          )
        })}
      </div>
      <div className="sr-stage-compact__meta">
        <span className="sr-stage-compact__step">
          Step {current.index + 1} of {current.total}
        </span>
        <span className="sr-stage-compact__label" style={{ color: style.text }}>
          {current.label}
        </span>
        <span className="sr-stage-compact__detail">{current.detail}</span>
      </div>
    </div>
  )
}

/** Card-based workflow rail for order detail (matches legacy stepper design) */
export function WorkflowStageSteps({ workflow }: { workflow: OrderWorkflow }) {
  const current = getCurrentWorkflowStage(workflow)

  return (
    <div className="od-stage-cards" role="list" aria-label="Workflow stages">
      {WORKFLOW_STAGES.map((s, i) => {
        const step = workflow[s.key]
        const isCurrent = i === current.index
        const detail = stageDetail(s.key, step)
        const showChecksLink =
          isChecksStage(s.key) &&
          (step.status === 'passed' || step.status === 'warning' || step.status === 'failed')
        const showWaitingBadge = step.status === 'waiting' || step.status === 'pending'

        return (
          <div key={s.key} className="od-stage-cards__slot" role="listitem">
            {i > 0 && (
              <span
                className={cn(
                  'od-stage-cards__connector',
                  workflow[WORKFLOW_STAGES[i - 1].key].status === 'passed' && 'is-past'
                )}
                aria-hidden
              />
            )}
            <div
              className={cn(
                'od-stage-card',
                isCurrent && 'is-current',
                step.status === 'passed' && 'is-passed',
                `od-stage-card--${step.status}`
              )}
            >
              <div className="od-stage-card__head">
                <span
                  className={cn(
                    'od-stage-card__icon',
                    step.status === 'passed' && 'is-passed',
                    (step.status === 'waiting' || step.status === 'pending') && 'is-pending',
                    step.status === 'warning' && 'is-warning',
                    step.status === 'failed' && 'is-failed'
                  )}
                  aria-hidden
                >
                  {step.status === 'passed' ? (
                    <CheckCircle2 size={15} strokeWidth={2} />
                  ) : step.status === 'warning' ? (
                    <AlertCircle size={15} strokeWidth={2} />
                  ) : (
                    <Clock size={15} strokeWidth={2} />
                  )}
                </span>
                <span className="od-stage-card__title">{s.label}</span>
                {showWaitingBadge && (
                  <span className="od-stage-card__badge">Waiting</span>
                )}
                <button type="button" className="od-stage-card__menu" aria-label={`${s.label} options`}>
                  <MoreVertical size={14} strokeWidth={2} />
                </button>
              </div>
              <div className="od-stage-card__body">
                {showChecksLink ? (
                  <button type="button" className="od-stage-card__checks">
                    <List size={12} strokeWidth={2} />
                    {detail}
                  </button>
                ) : (
                  <span className="od-stage-card__detail">{detail}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** @deprecated Use WorkflowStageBadge or WorkflowStageCompact */
export function WorkflowBar({ workflow }: { workflow: OrderWorkflow; activeKey?: string }) {
  return <WorkflowStageCompact workflow={workflow} />
}

export function WorkflowStepper({ workflow }: { workflow: OrderWorkflow; compact?: boolean }) {
  return <WorkflowStageCompact workflow={workflow} />
}

export function WorkflowDots({ workflow }: { workflow: OrderWorkflow }) {
  return <WorkflowStageBadge workflow={workflow} compact />
}
