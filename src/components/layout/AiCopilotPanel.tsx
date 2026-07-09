import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { useUiStore } from '@/stores/ui-store'
import { useCopilotStore } from '@/stores/ui-store'
import { answerQuery } from '@/lib/ai'
import { cn } from '@/lib/cn'

const suggestions = [
  "What's blocking the 36 orders?",
  'Unbilled Labatt orders over 30 days',
  'Draft a rate-variance report',
  'Which invoices are overdue?',
]

export function AiCopilotPanel() {
  const open = useUiStore((s) => s.copilotOpen)
  const setOpen = useUiStore((s) => s.setCopilotOpen)
  const { messages, loading, addMessage, setLoading } = useCopilotStore()
  const [input, setInput] = useState('')

  const send = async (text: string) => {
    if (!text.trim()) return
    addMessage('user', text)
    setInput('')
    setLoading(true)
    const answer = await answerQuery(text)
    addMessage('assistant', answer)
    setLoading(false)
  }

  return (
    <Drawer open={open} onClose={() => setOpen(false)} title="AI Copilot" width={400}>
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ai-gradient">
                <Sparkles size={18} strokeWidth={1.7} className="text-white" />
              </div>
              <p className="text-[14px] font-semibold">How can I help?</p>
              <p className="mt-1 text-[12px] text-ink-3">Ask about orders, invoices, rates, or billing status.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                msg.role === 'user'
                  ? 'ml-auto bg-accent text-white rounded-br-[5px]'
                  : 'bg-[#F2F2F6] text-ink rounded-bl-[5px]'
              )}
            >
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          ))}
          {loading && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-[5px] bg-[#F2F2F6] px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] text-ink-2 hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about billing…"
              className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <button type="submit" className="rounded-xl ai-gradient p-2.5 text-white">
              <Send size={16} strokeWidth={1.7} />
            </button>
          </form>
        </div>
      </div>
    </Drawer>
  )
}
