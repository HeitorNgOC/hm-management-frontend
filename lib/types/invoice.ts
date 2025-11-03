export interface Invoice {
  id: string
  companyId: string
  invoiceNumber: string
  supplierId: string
  supplier?: Supplier
  items: InvoiceItem[]
  totalAmount: number
  dueDate: string
  issueDate: string
  status: InvoiceStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  itemId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled"

export interface Supplier {
  id: string
  name: string
}

export interface CreateInvoiceRequest {
  invoiceNumber: string
  supplierId: string
  dueDate: string
  items: CreateInvoiceItem[]
  notes?: string
}

export interface CreateInvoiceItem {
  itemId: string
  quantity: number
  unitPrice: number
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus
  notes?: string
}

export interface InvoiceFilters {
  supplierId?: string
  status?: InvoiceStatus
  startDate?: string
  endDate?: string
}
