import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { AiCopilotPanel } from '@/components/layout/AiCopilotPanel'
import { ToastContainer } from '@/components/ui/Toast'

export function AppShell() {
  return (
    <div className="sr-app flex h-full min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="sr-main flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
      <AiCopilotPanel />
      <ToastContainer />
    </div>
  )
}
