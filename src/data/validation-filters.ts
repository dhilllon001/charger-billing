export const pipelineCounts = {
  all: 1412,
  rate_validated: 735,
  rate_validation: 677,
  ops_validated: 714,
  ops_validation: 698,
  pod_verified: 460,
  rfi: 589,
  ready: 92,
  invoiced: 0,
  email_delivery: 0,
  as: 0,
} as const

export const rateValidationFilters = [
  { id: 'rate_validated', label: 'Rate validated', count: 735, variant: 'success' as const },
  { id: 'rate_validation', label: 'Rate validation', count: 677, variant: 'error' as const },
  { id: 'missing_lane', label: 'Missing Lane', count: 411 },
  { id: 'zero_invoice_total', label: 'Zero Invoice Total', count: 444 },
  { id: 'zero_negative_charges', label: 'Check For Zero Or Negative Charges', count: 455 },
  { id: 'missing_required_charges', label: 'Missing Required Charges', count: 249 },
  { id: 'missing_rates_lane', label: 'Missing Rates on Lane', count: 174 },
  { id: 'tax_code_g', label: 'Tax code G required', count: 95 },
  { id: 'expired_rates_lane', label: 'Expired Rates on Lane', count: 4 },
]

export const opsValidationFilters = [
  { id: 'ops_validated', label: 'Ops validated', count: 714, variant: 'success' as const },
  { id: 'ops_validation', label: 'Ops validation', count: 698, variant: 'error' as const },
  { id: 'hazmat_charge', label: 'Hazmat Charge Required', count: 3 },
  { id: 'missing_pod', label: 'Missing POD', count: 460 },
  { id: 'order_notes', label: 'Order Notes/Instructions Attentions', count: 263 },
  { id: 'waiting_po_category', label: 'Waiting PO Category', count: 13 },
  { id: 'three_ways', label: '3-Ways Validations', count: 40 },
  { id: 'valid_currency', label: 'Valid Currency', count: 42 },
  { id: 'valid_division', label: 'Valid Division', count: 15 },
  { id: 'missing_spot_charge', label: 'Missing SPOT Charge', count: 14 },
  { id: 'team_driver', label: 'Order Contains Team Driver', count: 9 },
  { id: 'missing_caller', label: "Missing Caller's Name", count: 14 },
  { id: 'missing_pickup_date', label: 'Missing Pickup Date', count: 6 },
  { id: 'missing_delivery_date', label: 'Missing Delivery Date', count: 6 },
  { id: 'load_confirmation', label: 'Load Confirmation Validation', count: 1 },
  { id: 'lane_po', label: 'Lane PO Validation', count: 30 },
  { id: 'wrong_lane_currency', label: 'Wrong Lane Currency', count: 27 },
  { id: 'cross_border', label: 'Cross Border Shipment Validation', count: 3 },
  { id: 'invalid_customer_tax', label: 'Invalid Customer Tax', count: 4 },
  { id: 'missing_bol', label: 'Missing BOL', count: 2 },
  { id: 'duplicate_po', label: 'Duplicate PO Number', count: 12 },
  { id: 'missing_equipment', label: 'Missing Equipment', count: 1 },
]

export const consolidatedValidationGroups = [
  { id: 'no_error', label: 'No Error', count: 3 },
  { id: 'operation_validation', label: 'OperationValidation', count: 1 },
  { id: 'rate_validation', label: 'RateValidation', count: 7 },
]
