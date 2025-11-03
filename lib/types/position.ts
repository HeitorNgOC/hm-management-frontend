import type { Permission } from "./user"

export interface Position {
  id: string
  companyId: string
  name: string
  description?: string
  permissions: Permission[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePositionRequest {
  name: string
  description?: string
  permissions: Permission[]
}

export interface UpdatePositionRequest {
  name?: string
  description?: string
  permissions?: Permission[]
}

export const AVAILABLE_PERMISSIONS: Array<{
  key: Permission
  label: string
  description: string
  category: string
}> = [
  {
    key: "users.view",
    label: "Visualizar Usuários",
    description: "Pode ver a lista de usuários",
    category: "Usuários",
  },
  {
    key: "users.create",
    label: "Criar Usuários",
    description: "Pode criar novos usuários",
    category: "Usuários",
  },
  {
    key: "users.edit",
    label: "Editar Usuários",
    description: "Pode editar usuários existentes",
    category: "Usuários",
  },
  {
    key: "users.delete",
    label: "Remover Usuários",
    description: "Pode remover usuários",
    category: "Usuários",
  },
  {
    key: "appointments.view",
    label: "Visualizar Agendamentos",
    description: "Pode ver agendamentos",
    category: "Agendamentos",
  },
  {
    key: "appointments.create",
    label: "Criar Agendamentos",
    description: "Pode criar novos agendamentos",
    category: "Agendamentos",
  },
  {
    key: "appointments.edit",
    label: "Editar Agendamentos",
    description: "Pode editar agendamentos",
    category: "Agendamentos",
  },
  {
    key: "appointments.delete",
    label: "Cancelar Agendamentos",
    description: "Pode cancelar agendamentos",
    category: "Agendamentos",
  },
  {
    key: "inventory.view",
    label: "Visualizar Estoque",
    description: "Pode ver o estoque",
    category: "Estoque",
  },
  {
    key: "inventory.create",
    label: "Adicionar ao Estoque",
    description: "Pode adicionar itens ao estoque",
    category: "Estoque",
  },
  {
    key: "inventory.edit",
    label: "Editar Estoque",
    description: "Pode editar itens do estoque",
    category: "Estoque",
  },
  {
    key: "inventory.delete",
    label: "Remover do Estoque",
    description: "Pode remover itens do estoque",
    category: "Estoque",
  },
  {
    key: "financial.view",
    label: "Visualizar Financeiro",
    description: "Pode ver dados financeiros",
    category: "Financeiro",
  },
  {
    key: "financial.manage",
    label: "Gerenciar Financeiro",
    description: "Pode gerenciar transações financeiras",
    category: "Financeiro",
  },
  {
    key: "reports.view",
    label: "Visualizar Relatórios",
    description: "Pode ver relatórios",
    category: "Relatórios",
  },
  {
    key: "settings.view",
    label: "Visualizar Configurações",
    description: "Pode ver configurações",
    category: "Configurações",
  },
  {
    key: "settings.edit",
    label: "Editar Configurações",
    description: "Pode editar configurações da empresa",
    category: "Configurações",
  },
]
