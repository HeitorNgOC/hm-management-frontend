export interface Table {
  id: string
  companyId: string
  number: string
  capacity: number
  status: TableStatus
  currentOrderId?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning"

export interface Order {
  id: string
  companyId: string
  tableId?: string
  table?: Table
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  customerId?: string
  customerName?: string
  notes?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category?: ProductCategory
  imageUrl?: string
  available: boolean
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "partially_paid"

export interface CreateTableRequest {
  number: string
  capacity: number
  location?: string
}

export interface UpdateTableRequest {
  number?: string
  capacity?: number
  status?: TableStatus
  location?: string
}

export interface CreateOrderRequest {
  tableId?: string
  customerName?: string
  items: Array<{
    productId: string
    quantity: number
    notes?: string
  }>
  notes?: string
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  discount?: number
  notes?: string
}

export interface AddOrderItemRequest {
  productId: string
  quantity: number
  notes?: string
}
