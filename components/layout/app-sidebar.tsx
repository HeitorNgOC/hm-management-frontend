"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  DollarSign,
  Settings,
  Briefcase,
  Clock,
  TrendingUp,
  FileText,
  CreditCard,
  Utensils,
  BarChart3,
  Mail,
  Gift,
  Target,
  Building2,
  Dumbbell,
  ClipboardList,
  Activity,
  Stethoscope,
  Users2,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { PermissionGate } from "@/components/auth/permission-gate"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permissions?: string[]
  roles?: string[]
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Dashboard Personalizado",
    href: "/custom-dashboard",
    icon: Settings,
  },
  {
    title: "Usuários",
    href: "/users",
    icon: Users,
    permissions: ["users.view"],
  },
  {
    title: "Cargos",
    href: "/positions",
    icon: Briefcase,
    permissions: ["positions.view"],
  },
  {
    title: "Funcionários",
    href: "/employees",
    icon: Users2,
    permissions: ["users.view"],
  },
  {
    title: "Agendamentos",
    href: "/appointments",
    icon: Calendar,
    permissions: ["appointments.view"],
  },
  {
    title: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Serviços",
    href: "/services",
    icon: Briefcase,
  },
  {
    title: "Pacotes",
    href: "/packages",
    icon: Gift,
  },
  {
    title: "Inventário",
    href: "/inventory",
    icon: Package,
    permissions: ["inventory.view"],
  },
  {
    title: "Trocas",
    href: "/exchanges",
    icon: RefreshCw,
  },
  {
    title: "Financeiro",
    href: "#",
    icon: DollarSign,
    permissions: ["financial.view"],
    children: [
      {
        title: "Visão Geral",
        href: "/financial",
        icon: BarChart3,
      },
      {
        title: "Caixa",
        href: "/cash-register",
        icon: DollarSign,
      },
      {
        title: "Pagamentos",
        href: "/payments",
        icon: CreditCard,
      },
      {
        title: "Comissões",
        href: "/commissions",
        icon: TrendingUp,
      },
      {
        title: "% Padrão Comissões",
        href: "/commission-default-percentages",
        icon: TrendingUp,
      },
      {
        title: "Notas Fiscais",
        href: "/invoices",
        icon: FileText,
      },
      {
        title: "NFS-e",
        href: "/nfse",
        icon: FileText,
      },
    ],
  },
  {
    title: "Academia",
    href: "#",
    icon: Dumbbell,
    children: [
      {
        title: "Modalidades",
        href: "/gym/modalities",
        icon: Dumbbell,
      },
      {
        title: "Turmas",
        href: "/gym/classes",
        icon: Users2,
      },
      {
        title: "Inscrições",
        href: "/gym/enrollments",
        icon: ClipboardCheck,
      },
      {
        title: "Fichas de Treino",
        href: "/gym/workout-plans",
        icon: ClipboardList,
      },
      {
        title: "Evolução",
        href: "/gym/progress",
        icon: Activity,
      },
    ],
  },
  {
    title: "Guichê",
    href: "/queue/dashboard",
    icon: Users2,
  },
  {
    title: "Prontuário",
    href: "#",
    icon: Stethoscope,
    children: [
      {
        title: "Pacientes",
        href: "/medical/patients",
        icon: Users,
      },
    ],
  },
  {
    title: "Restaurante",
    href: "/restaurant",
    icon: Utensils,
    permissions: ["restaurant.view"],
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: Mail,
  },
  {
    title: "Metas",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Intervalos",
    href: "/employee-time-intervals",
    icon: Clock,
  },
  {
    title: "Assinatura",
    href: "/subscription",
    icon: CreditCard,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    permissions: ["settings.view"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href) && href !== "#"
  }

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <PermissionGate key={item.title} permissions={item.permissions as any} roles={item.roles as any}>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={item.title} className="w-full justify-start">
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              {(item.children || []).map((child) => (
                <PermissionGate key={child.title} permissions={child.permissions as any} roles={child.roles as any}>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive(child.href)}>
                      <Link href={child.href}>
                        <child.icon className="h-4 w-4" />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </PermissionGate>
              ))}
            </SidebarMenuSub>
          </SidebarMenuItem>
        </PermissionGate>
      )
    }

    return (
      <PermissionGate key={item.title} permissions={item.permissions as any} roles={item.roles as any}>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.href)}>
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </PermissionGate>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-6 w-6" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">HM Management</span>
            <span className="text-xs text-muted-foreground">Sistema de Gestão</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{navItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
