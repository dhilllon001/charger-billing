import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { BatchInvoicingPage } from '@/features/batch-invoicing/BatchInvoicingPage'
import { ConsolidatedPage } from '@/features/consolidated/ConsolidatedPage'
import { InvoicedPage } from '@/features/invoiced/InvoicedPage'
import { EmailDeliveryPage } from '@/features/email-delivery/EmailDeliveryPage'
import { RatesFuelPage } from '@/features/rates-fuel/RatesFuelPage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { PermissionsPage } from '@/features/permissions/PermissionsPage'
import { OrderDetailPage } from '@/features/orders/OrderDetailPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/batch-invoicing" element={<BatchInvoicingPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/consolidated" element={<ConsolidatedPage />} />
          <Route path="/invoiced" element={<InvoicedPage />} />
          <Route path="/email-delivery" element={<EmailDeliveryPage />} />
          <Route path="/rates-fuel" element={<RatesFuelPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
