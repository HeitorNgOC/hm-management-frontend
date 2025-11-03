export interface InventoryItem {
  id: string
  companyId: string
  name: string
  description?: string
  sku: string
  categoryId: string
  category?: InventoryCategory
  quantity: number
  minQuantity: number
  unit: string
  costPrice: number
  sellPrice?: number
  supplierId?: string
  supplier?: Supplier
  location?: string
  expirationDate?: string
  status: InventoryStatus
  createdAt: string
  updatedAt: string
}

export interface InventoryCategory {
  id: string
  name: string
  description?: string
}

export interface Supplier {
  id: string
  name: string
  contact?: string
  phone?: string
  email?: string
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock"

export interface InventoryMovement {
  id: string
  companyId: string
  itemId: string
  item: InventoryItem
  type: MovementType
  quantity: number
  reason?: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

export type MovementType = "entry" | "exit" | "adjustment" | "loss"

export interface CreateInventoryItemRequest {
  name: string
  description?: string
  sku: string
  categoryId: string
  quantity: number
  minQuantity: number
  unit: string
  costPrice: number
  sellPrice?: number
  supplierId?: string
  location?: string
  expirationDate?: string
}

export interface UpdateInventoryItemRequest {
  name?: string
  description?: string
  sku?: string
  categoryId?: string
  minQuantity?: number
  unit?: string
  costPrice?: number
  sellPrice?: number
  supplierId?: string
  location?: string
  expirationDate?: string
}

export interface CreateMovementRequest {
  itemId: string
  type: MovementType
  quantity: number
  reason?: string
}

export interface InventoryFilters {
  search?: string
  categoryId?: string
  status?: InventoryStatus
  supplierId?: string
}
