export async function answerQuery(q: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 550))
  const lower = q.toLowerCase()

  if (lower.includes('block') || lower.includes('blocking')) {
    return `**36 orders** are currently blocked:\n\n• **14** — POD missing or unverified\n• **12** — Rate variance exceeds contract threshold\n• **6** — Ops validation pending\n• **4** — Duplicate invoice risk detected\n\nThe highest-impact unblock is resolving POD for Labatt orders (8 orders, **$124,300**).`
  }

  if (lower.includes('labatt') && (lower.includes('unbill') || lower.includes('30'))) {
    return `Found **47 unbilled Labatt Brewing Co orders** over the last 30 days totaling **$892,450**.\n\n• 32 are **Ready** to invoice\n• 11 need **rate review** (avg variance −3.1%)\n• 4 blocked on **POD**\n\nWould you like me to filter the batch view to these orders?`
  }

  if (lower.includes('variance') || lower.includes('report')) {
    return `**Rate Variance Report — Last 30 Days**\n\n• **23 orders** flagged with variance > 2%\n• Largest: BMW SLP (−4.2%, **$18,200**)\n• Home Depot Mexico (+3.8%, **$9,400**)\n• Net impact: **−$42,100** vs contracted rates\n\n3 rate cards expire within 10 days — recommend renewal before next batch.`
  }

  if (lower.includes('overdue') || lower.includes('invoice')) {
    return `**Overdue Invoices Summary**\n\n• **18 invoices** overdue totaling **$284,920**\n• Oldest: INV-2026-0412 (P&G) — **42 days**, **$31,200**\n• **6 customers** account for 78% of overdue AR\n\nTop action: resend delivery for 4 invoices marked "Sent · unread".`
  }

  return `I can help with billing insights. Try asking about:\n• Blocked or unbilled orders\n• Rate variance reports\n• Overdue invoices\n• Customer-specific billing status`
}
