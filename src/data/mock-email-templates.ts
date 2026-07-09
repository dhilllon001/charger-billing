import type { EmailTemplate } from './models'

export const emailTemplates: EmailTemplate[] = [
  { id: 'et-1', name: 'Bendix CLIJ_BCO', template: 'Invoice {Invoice} for {Customer}', configurationType: 'Subject', modifiedBy: 'singh.davinder@chargerlogistics.com', modifiedOn: '2026-06-15T10:30:00' },
  { id: 'et-2', name: 'Body Template', template: '<div style="font-family: Arial">Dear {Customer}, please find attached invoice {Invoice}.</div>', configurationType: 'Body', modifiedBy: 'singh.davinder@chargerlogistics.com', modifiedOn: '2026-06-14T14:20:00' },
  { id: 'et-3', name: 'Invoice #', template: 'Invoice #{Invoice} - {PONO}', configurationType: 'Subject', modifiedBy: 'reena.bhatia@chargerlogistics.com', modifiedOn: '2026-06-12T09:15:00' },
  { id: 'et-4', name: 'Consolidated Invoice', template: 'Consolidated Invoice {Invoice} - {Customer}', configurationType: 'Subject', modifiedBy: 'harmandeep.singh@chargerlogistics.com', modifiedOn: '2026-06-10T16:45:00' },
  { id: 'et-5', name: 'Credit Note Body', template: 'Please find attached credit note {Invoice} for order {OrderNo}.', configurationType: 'Body', modifiedBy: 'vipul.patel@chargerlogistics.com', modifiedOn: '2026-06-08T11:00:00' },
]
