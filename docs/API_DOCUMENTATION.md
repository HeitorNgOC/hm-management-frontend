# API Documentation - HM Management System

## Índice
1. [Módulo IAM (Identity & Access Management)](#módulo-iam-identity--access-management)
2. [Autenticação](#autenticação)
3. [Empresa](#empresa)
4. [Usuários](#usuários)
5. [Posições/Cargos](#posiçõescargos)
6. [Clientes](#clientes)
7. [Serviços](#serviços)
8. [Pacotes](#pacotes)
9. [Agendamentos](#agendamentos)
10. [Intervalos de Trabalho (Funcionários)](#intervalos-de-trabalho-funcionários)
11. [Caixa (Cash Register)](#caixa-cash-register)
12. [Transações Financeiras](#transações-financeiras)
13. [Resumo Financeiro](#resumo-financeiro)
14. [Fornecedores](#fornecedores)
15. [Inventário/Estoque](#inventárioestoque)
16. [Módulo Academia (Gym)](#módulo-academia-gym)
17. [Módulo Ficha de Treino (Workout)](#módulo-ficha-de-treino-workout)
18. [Módulo Guichê de Atendimento (Queue)](#módulo-guichê-de-atendimento-queue)
19. [Módulo Prontuário Médico (Medical Records)](#módulo-prontuário-médico-medical-records)
20. [Módulo Trocas de Produtos (Exchange)](#módulo-trocas-de-produtos-exchange)
21. [Restaurante](#restaurante)
22. [Marketing](#marketing)
23. [Metas](#metas)
24. [Configurações](#configurações)
25. [Assinaturas e Pagamentos](#assinaturas-e-pagamentos)
26. [Módulo Dashboard](#módulo-dashboard)

---

## Módulo IAM (Identity & Access Management)

Este módulo consolida Autenticação, Empresa (tenant), Usuários e Posições/Cargos, definindo o modelo de identidade e controle de acesso multi-tenant.

Observações importantes:
- Todas as rotas (exceto fluxos públicos de convite/reset/verificação) exigem JWT no header Authorization.
- O tenant é derivado exclusivamente do JWT (claim `companyId`). Não envie `companyId` em headers, query params ou body.
- O primeiro usuário administrador é mockado no ambiente atual; não há fluxo de criação inicial de tenant no escopo deste documento.
- Evite cadastro direto de usuários sem contexto de empresa; utilize convites.

### Entidades

#### Company (Tenant)
Campos sugeridos:
```typescript
interface Company {
  id: string
  name: string                 // Razão/Nome fantasia
  cnpj?: string                // Opcional no trial; obrigatório para emissão fiscal
  email: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  settings?: {
    language?: string
    timeZone?: string
    currency?: string
  }
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired'
  createdAt: string
  updatedAt: string
}
```
Restrições/Índices:
- UNIQUE (cnpj) quando informado.
- Dados sempre isolados por `companyId`.

#### User
```typescript
type UserRole = 'admin' | 'manager' | 'employee'
type UserStatus = 'active' | 'inactive' | 'on_leave'

interface User {
  id: string
  companyId: string
  name: string
  email: string               // único no sistema OU único por empresa + slug de login (ver notas)
  phone?: string
  cpf?: string
  positionId?: string         // vínculo a Position
  role: UserRole              // macro-perfil
  permissions: Permission[]   // efetivas (derivadas de Position + ajustes)
  status: UserStatus
  avatar?: string
  hireDate?: string
  salary?: number
  commission?: number
  createdAt: string
  updatedAt: string
}
```
Restrições/Notas:
- Recomendado email UNIQUE global para simplificar login. Alternativa: permitir mesmo email em tenants diferentes exigindo `companySlug` no login.
- Deve haver pelo menos 1 usuário `admin` ativo por empresa (bloquear remoção/alteração que viole isso).

#### Position (Cargo)
```typescript
interface Position {
  id: string
  companyId: string
  name: string
  description?: string
  permissions: Permission[]   // lista de chaves canônicas
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
```
Regra:
- Não permitir excluir cargo vinculado a usuários (ou exigir reatribuição).

#### Permission (Catálogo)
Chaves canônicas sugeridas (extensível):
- users.view/create/edit/delete
- positions.view/create/edit/delete
- appointments.view/create/edit/delete
- inventory.view/create/edit/delete
- financial.view/manage
- reports.view, settings.view/edit, payments.view/manage

#### Token (JWT)
Payload recomendado:
```json
{
  "userId": "uuid",
  "companyId": "uuid",
  "role": "admin|manager|employee",
  "permissions": ["users.view", "settings.edit"],
  "iat": 1730610000,
  "exp": 1730617200
}
```

### Fluxos de Autenticação e Provisionamento

1) Admin inicial (mock)
- No ambiente atual o primeiro admin/tenant é provisionado fora do fluxo de API (mock). Não há endpoint público de "tenant/register". Siga diretamente para o fluxo de convites.

2) Convite de Usuário (com token do admin)
- `POST /api/iam/invitations` cria convite e envia e-mail com `inviteToken`.
- `POST /api/iam/invitations/list` lista convites (filtros/paginação) via corpo da requisição.
- `POST /api/iam/invitations/get` retorna um convite por `id`.
- `POST /api/iam/invitations/resend` reenvia o convite por `id`.
- `POST /api/iam/invitations/delete` revoga o convite por `id`.
- `POST /api/auth/accept-invite` consome `inviteToken` e define senha (público).

Requests:
```typescript
// criar convite (admin autenticado)
{ email: string; name?: string; role?: UserRole; positionId?: string }

// aceitar convite (público)
{ inviteToken: string; name?: string; password: string }
```

Padrão de corpo para convites (admin autenticado)
```typescript
// Criar convite
POST /api/iam/invitations
{
  email: string,
  name?: string,
  role?: UserRole,
  positionId?: string
}

// Listar convites (paginação e filtros)
POST /api/iam/invitations/list
{
  page?: number,
  limit?: number,
  search?: string,
  status?: 'pending' | 'accepted' | 'expired' | 'revoked'
}

// Buscar convite por id
POST /api/iam/invitations/get
{ id: string }

// Reenviar convite por id
POST /api/iam/invitations/resend
{ id: string }

// Revogar/Excluir convite por id
POST /api/iam/invitations/delete
{ id: string }
```

Respostas:
```typescript
// criação
Invitation

// listagem paginada
{ data: Invitation[]; pagination: PaginationMeta }

// aceitar convite (login público pós-onboarding)
{ user: User; token: { token: string; refreshToken?: string } }
```

3) Login / Refresh / Logout
- `POST /api/auth/login` { email, password } -> { user, token, refreshToken }
- `POST /api/auth/refresh` { refreshToken } -> { token }
- `POST /api/auth/logout`

4) Recuperação de Senha e Verificação de E-mail
- `POST /api/auth/forgot-password` { email }
- `POST /api/auth/reset-password` { token, newPassword }
- `POST /api/auth/verify-email` { token }

### Endpoints — Company (Tenant)

- `GET /api/company/profile` -> Company
- `PUT /api/company/info` (CompanyInfoData) -> Company
- `PUT /api/company/operating-hours` { operatingHours: OperatingHours[] } -> Company
- `GET /api/company/service-categories` -> ServiceCategory[]
- `POST /api/company/service-categories` -> ServiceCategory
- `PUT /api/company/service-categories/:id` -> ServiceCategory
- `DELETE /api/company/service-categories/:id`
- `GET /api/company/payment-methods` -> PaymentMethod[]
- `PUT /api/company/payment-methods` { paymentMethods: PaymentMethod[] } -> PaymentMethod[]

Notas:
- Todas filtrando por `companyId` do token.

### Endpoints — Users (token-only tenant)

- `POST /api/users/list` { page, limit, search, role, status, positionId } -> { data: User[], pagination }
- `POST /api/users/get` { id } -> User
- `POST /api/users` (CreateUserRequest) -> User
- `PATCH /api/users/:id` (UpdateUserRequest) -> User
- `POST /api/users/status` { id, status } -> User
- `POST /api/users/delete` { id }

Regras:
- Bloquear ações que deixem a empresa sem admin ativo.
- Email único (ver decisão acima).

### Endpoints — Positions (token-only tenant)

- `POST /api/positions/list` { page, limit } -> { data: Position[], pagination }
- `POST /api/positions/get` { id } -> Position
- `POST /api/positions` (CreatePositionRequest) -> Position
- `PATCH /api/positions/:id` (UpdatePositionRequest) -> Position
- `POST /api/positions/delete` { id }
- `GET /api/iam/permissions` -> Permission[] (catálogo de permissões e descrições)

Regras:
- Impedir exclusão se houver usuários vinculados (ou exigir reatribuição).

### Erros e Códigos
- 400 validação, 401 auth, 403 permissão, 404 não encontrado, 409 conflito (email duplicado, excluir cargo em uso), 422 regras de negócio (sem admin restante).

### Esquemas de Banco (sugestão)

companies
```sql
id uuid PK, name text not null, cnpj text unique, email text not null,
phone text, address jsonb, settings jsonb, subscription_status text,
created_at timestamp, updated_at timestamp
```

positions
```sql
id uuid PK, company_id uuid not null references companies(id) on delete cascade,
name text not null, description text, permissions jsonb not null,
is_default boolean default false, created_at timestamp, updated_at timestamp,
unique(company_id, name)
```

users
```sql
id uuid PK, company_id uuid not null references companies(id) on delete cascade,
name text not null, email text not null unique, phone text, cpf text,
position_id uuid references positions(id), role text, permissions jsonb,
status text default 'active', password_hash text not null,
created_at timestamp, updated_at timestamp
```

invitations (opcional, recomendado)
```sql
id uuid PK, company_id uuid not null references companies(id) on delete cascade,
email text not null, role text, position_id uuid references positions(id),
token text not null unique, expires_at timestamp, accepted_at timestamp,
created_at timestamp
```

Notas:
- Permissões efetivas do usuário podem ser calculadas como união(Position.permissions, ajustes do usuário). Persistir cópia em `users.permissions` acelera leitura, mas deve ser sincronizada ao editar cargo.

---

## Autenticação

### POST /api/auth/login
Autentica o usuário e retorna tokens.

Request Body:
```typescript
{
  email: string
  password: string
}
```

Response:
```typescript
{
  user: User
  token: string             // JWT de acesso
  refreshToken?: string
}
```

### POST /api/auth/register
Cria um usuário e empresa inicial (onboarding).

Nota: No ambiente multi-tenant atual, o cadastro direto está desabilitado. O fluxo oficial para inclusão de usuários é via convites (`/api/iam/invitations` + `/api/auth/accept-invite`). Este endpoint permanece apenas como referência/legado.

Request Body:
```typescript
{
  name: string
  email: string
  password: string
  phone?: string
  companyName: string
}
```

Response: AuthResponse

### GET /api/auth/me
Retorna o usuário autenticado atual.

Response: User

### POST /api/auth/logout
Invalida a sessão atual.

### POST /api/auth/refresh
Renova o token de acesso.

Request Body:
```typescript
{ refreshToken: string }
```

Response:
```typescript
{ token: string }
```

### POST /api/auth/forgot-password
Dispara e-mail de recuperação de senha.

Request Body: `{ email: string }`

### POST /api/auth/reset-password
Redefine a senha com token recebido por e-mail.

Request Body:
```typescript
{ token: string; newPassword: string }
```

### POST /api/auth/verify-email
Confirma e-mail do usuário com token.

Request Body: `{ token: string }`

---

## Empresa

### GET /api/company/profile
Retorna os dados completos da empresa.

Response: Company

### PUT /api/company/info
Atualiza informações básicas da empresa.

Request Body: CompanyInfoData

Response: Company

### PUT /api/company/operating-hours
Atualiza horários de funcionamento.

Request Body:
```typescript
{ operatingHours: OperatingHours[] }
```

Response: Company

### GET /api/company/service-categories
Lista categorias de serviços da empresa.

Response: ServiceCategory[]

### POST /api/company/service-categories
Cria uma categoria de serviço.

Request Body: Omit<ServiceCategory, "id">

Response: ServiceCategory

### PUT /api/company/service-categories/:id
Atualiza uma categoria de serviço.

### DELETE /api/company/service-categories/:id
Remove uma categoria de serviço.

### GET /api/company/payment-methods
Lista métodos de pagamento aceitos.

Response: PaymentMethod[]

### PUT /api/company/payment-methods
Atualiza métodos de pagamento.

Request Body:
```typescript
{ paymentMethods: PaymentMethod[] }
```

### POST /api/company/complete-onboarding
Marca o onboarding como concluído.

---

## Usuários

### GET /api/users
Lista usuários com filtros e paginação.

Query Parameters:
```typescript
{
  search?: string
  role?: "admin" | "manager" | "employee"
  status?: "active" | "inactive" | "on_leave"
  positionId?: string
  page?: number
  limit?: number
}
```

Response:
```typescript
{
  data: User[]
  pagination: PaginationMeta
}
```

### GET /api/users/:id
Retorna um usuário específico.

### POST /api/users
Cria um novo usuário.

Request Body: CreateUserRequest

### PATCH /api/users/:id
Atualiza dados do usuário.

Request Body: UpdateUserRequest

### PATCH /api/users/:id/status
Atualiza o status do usuário.

Request Body:
```typescript
{ status: "active" | "inactive" | "on_leave" }
```

### DELETE /api/users/:id
Remove um usuário.

---

## Posições/Cargos

### GET /api/positions
Lista posições/cargos da empresa.

Response: { data: Position[]; pagination: PaginationMeta }

### GET /api/positions/:id
Retorna uma posição.

### POST /api/positions
Cria uma nova posição com permissões.

Request Body: CreatePositionRequest

### PATCH /api/positions/:id
Atualiza uma posição.

Request Body: UpdatePositionRequest

### DELETE /api/positions/:id
Remove uma posição.

---

## Clientes

### GET /api/clients
Lista clientes (filtros opcionais).

Query Parameters: ClientFilters

Response: Client[]

### GET /api/clients/:id
Retorna um cliente.

### POST /api/clients
Cria um cliente.

Request Body: CreateClientRequest

### PUT /api/clients/:id
Atualiza um cliente.

Request Body: UpdateClientRequest

### DELETE /api/clients/:id
Remove um cliente.

### POST /api/clients/bulk-delete
Remove vários clientes de uma vez.

Request Body: `{ ids: string[] }`

---

## Serviços

### GET /api/services
Lista serviços (filtros por categoria/ativo).

Query Parameters: ServiceFilters

Response: Service[]

### GET /api/services/:id
Retorna um serviço.

### POST /api/services
Cria um serviço.

Request Body: CreateServiceRequest

### PUT /api/services/:id
Atualiza um serviço.

Request Body: UpdateServiceRequest

### DELETE /api/services/:id
Remove um serviço.

### POST /api/services/bulk-delete
Remove vários serviços.

Request Body: `{ ids: string[] }`

---

## Pacotes

### GET /api/packages
Lista pacotes de serviços/produtos.

Query Parameters: PackageFilters

Response: Package[]

### GET /api/packages/:id
Retorna um pacote.

### POST /api/packages
Cria um pacote.

Request Body: CreatePackageRequest

### PUT /api/packages/:id
Atualiza um pacote.

Request Body: UpdatePackageRequest

### DELETE /api/packages/:id
Remove um pacote.

### POST /api/packages/bulk-delete
Remove vários pacotes.

Request Body: `{ ids: string[] }`

---

## Agendamentos

### GET /api/appointments
Lista agendamentos com filtros e paginação.

Query Parameters:
```typescript
{
  date?: string
  employeeId?: string
  status?: AppointmentStatus
  clientId?: string
  page?: number
  limit?: number
}
```

Response: { data: Appointment[]; pagination: PaginationMeta }

### GET /api/appointments/:id
Retorna um agendamento.

### POST /api/appointments
Cria um novo agendamento.

Request Body: CreateAppointmentRequest

### PATCH /api/appointments/:id
Atualiza um agendamento.

Request Body: UpdateAppointmentRequest

### PATCH /api/appointments/:id/status
Atualiza o status do agendamento.

Request Body: `{ status: AppointmentStatus }`

### DELETE /api/appointments/:id
Remove um agendamento.

### GET /api/appointments/available-slots
Retorna horários disponíveis para um funcionário/serviço em uma data.

Query Parameters: `{ employeeId: string; date: string; serviceId: string }`

---

## Intervalos de Trabalho (Funcionários)

### GET /api/employee-time-intervals
Lista intervalos de trabalho por filtros.

Query Parameters: EmployeeTimeIntervalFilters

Response: EmployeeTimeInterval[]

### GET /api/employee-time-intervals/employee/:employeeId
Lista intervalos de um funcionário.

### GET /api/employee-time-intervals/:id
Retorna um intervalo específico.

### POST /api/employee-time-intervals
Cria um intervalo.

Request Body: CreateEmployeeTimeIntervalRequest

### PUT /api/employee-time-intervals/:id
Atualiza um intervalo.

Request Body: UpdateEmployeeTimeIntervalRequest

### DELETE /api/employee-time-intervals/:id
Remove um intervalo.

### POST /api/employee-time-intervals/bulk-delete
Remove vários intervalos.

Request Body: `{ ids: string[] }`

---

## Caixa (Cash Register)

### GET /api/cash-register/current
Retorna o caixa atual aberto (se houver).

Response: CashRegister

### GET /api/cash-register
Lista aberturas/fechamentos de caixa com paginação.

Response: { data: CashRegister[]; pagination: PaginationMeta }

### POST /api/cash-register/open
Abre um novo caixa.

Request Body: CreateCashRegisterRequest

### POST /api/cash-register/:id/close
Fecha o caixa.

Request Body: CloseCashRegisterRequest

---

## Transações Financeiras

### GET /api/transactions
Lista transações financeiras.

Query Parameters: TransactionFilters

Response: { data: Transaction[]; pagination: PaginationMeta }

### POST /api/transactions
Cria uma transação (receita ou despesa).

Request Body: CreateTransactionRequest

### DELETE /api/transactions/:id
Remove uma transação.

---

## Resumo Financeiro

### GET /api/financial/summary
Retorna um resumo do período.

Query Parameters: `{ startDate: string; endDate: string }`

Response: FinancialSummary

---

## Fornecedores

### GET /api/suppliers
Lista fornecedores com filtros.

Response: Supplier[]

### GET /api/suppliers/:id
Retorna um fornecedor.

### POST /api/suppliers
Cria um fornecedor.

Request Body: CreateSupplierRequest

### PUT /api/suppliers/:id
Atualiza um fornecedor.

Request Body: UpdateSupplierRequest

### DELETE /api/suppliers/:id
Remove um fornecedor.

### POST /api/suppliers/bulk-delete
Remove vários fornecedores.

Request Body: `{ ids: string[] }`

---

## Inventário/Estoque

### GET /api/inventory
Lista itens de estoque com filtros.

Query Parameters: InventoryFilters

Response: { data: InventoryItem[]; pagination: PaginationMeta }

### GET /api/inventory/:id
Retorna um item.

### POST /api/inventory
Cria um item.

Request Body: CreateInventoryItemRequest

### PATCH /api/inventory/:id
Atualiza um item.

Request Body: UpdateInventoryItemRequest

### DELETE /api/inventory/:id
Remove um item.

### GET /api/inventory/movements
Lista movimentações de estoque.

Query Parameters: `{ itemId?: string; page?: number; limit?: number }`

Response: { data: InventoryMovement[]; pagination: PaginationMeta }

### POST /api/inventory/movements
Registra uma movimentação de estoque (entrada/saída/ajuste/perda).

Request Body: CreateMovementRequest

### GET /api/inventory/low-stock
Retorna itens com estoque baixo.

Response: InventoryItem[]

---

## Módulo Academia (Gym)

### 1. Modalidades (Modalities)

#### GET /api/modalities
Lista todas as modalidades da empresa.

**Query Parameters:**
\`\`\`typescript
{
  search?: string          // Busca por nome ou descrição
  isActive?: boolean       // Filtrar por status ativo/inativo
  page?: number           // Número da página (padrão: 1)
  limit?: number          // Itens por página (padrão: 10)
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: Modality[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
\`\`\`

#### GET /api/modalities/:id
Busca uma modalidade específica por ID.

**Response:**
\`\`\`typescript
Modality
\`\`\`

#### POST /api/modalities
Cria uma nova modalidade.

**Request Body:**
\`\`\`typescript
{
  name: string                    // Nome da modalidade (ex: "Muay Thai")
  description?: string            // Descrição detalhada
  color?: string                  // Cor em hexadecimal (ex: "#FF5733")
  icon?: string                   // Nome do ícone
  maxStudentsPerClass: number     // Máximo de alunos por turma
  durationMinutes: number         // Duração padrão em minutos
}
\`\`\`

**Response:**
\`\`\`typescript
Modality
\`\`\`

#### PUT /api/modalities/:id
Atualiza uma modalidade existente.

**Request Body:**
\`\`\`typescript
{
  name?: string
  description?: string
  color?: string
  icon?: string
  maxStudentsPerClass?: number
  durationMinutes?: number
  isActive?: boolean
}
\`\`\`

**Response:**
\`\`\`typescript
Modality
\`\`\`

#### DELETE /api/modalities/:id
Remove uma modalidade (soft delete).

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 2. Turmas (Gym Classes)

#### GET /api/gym-classes
Lista todas as turmas.

**Query Parameters:**
\`\`\`typescript
{
  search?: string          // Busca por nome
  modalityId?: string      // Filtrar por modalidade
  instructorId?: string    // Filtrar por instrutor
  status?: "active" | "inactive" | "full" | "cancelled"
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: GymClass[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/gym-classes/:id
Busca uma turma específica com detalhes completos.

**Response:**
\`\`\`typescript
GymClass & {
  modality: Modality
  instructors: User[]
  enrollments: ClassEnrollment[]
}
\`\`\`

#### POST /api/gym-classes
Cria uma nova turma.

**Request Body:**
\`\`\`typescript
{
  modalityId: string              // ID da modalidade
  name: string                    // Nome da turma
  description?: string            // Descrição
  instructorIds: string[]         // IDs dos instrutores
  schedule: Array<{               // Horários da turma
    dayOfWeek: number            // 0-6 (Domingo-Sábado)
    startTime: string            // "HH:mm" (ex: "08:00")
    endTime: string              // "HH:mm" (ex: "09:30")
  }>
  maxStudents: number             // Máximo de alunos
  startDate: string               // Data de início (ISO 8601)
  endDate?: string                // Data de término (opcional)
}
\`\`\`

**Response:**
\`\`\`typescript
GymClass
\`\`\`

**Particularidades:**
- Valida se os instrutores existem e estão ativos
- Verifica conflitos de horário dos instrutores
- Calcula automaticamente `currentStudents` baseado nas inscrições ativas

#### PUT /api/gym-classes/:id
Atualiza uma turma existente.

**Request Body:**
\`\`\`typescript
{
  modalityId?: string
  name?: string
  description?: string
  instructorIds?: string[]
  schedule?: ClassSchedule[]
  maxStudents?: number
  startDate?: string
  endDate?: string
  status?: "active" | "inactive" | "full" | "cancelled"
}
\`\`\`

**Response:**
\`\`\`typescript
GymClass
\`\`\`

**Particularidades:**
- Se `maxStudents` for reduzido abaixo de `currentStudents`, retorna erro
- Atualiza automaticamente o status para "full" quando atingir capacidade máxima

#### DELETE /api/gym-classes/:id
Remove uma turma.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

**Particularidades:**
- Não permite deletar turmas com inscrições ativas
- Sugere cancelar a turma ao invés de deletar

---

### 3. Inscrições (Enrollments)

#### GET /api/enrollments
Lista todas as inscrições.

**Query Parameters:**
\`\`\`typescript
{
  search?: string          // Busca por nome do aluno
  classId?: string         // Filtrar por turma
  clientId?: string        // Filtrar por cliente
  status?: "active" | "inactive" | "suspended" | "cancelled"
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: ClassEnrollment[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/enrollments/:id
Busca uma inscrição específica.

**Response:**
\`\`\`typescript
ClassEnrollment & {
  class: GymClass
  client: Client
}
\`\`\`

#### POST /api/enrollments
Cria uma nova inscrição.

**Request Body:**
\`\`\`typescript
{
  classId: string          // ID da turma
  clientId: string         // ID do cliente
  notes?: string           // Observações
}
\`\`\`

**Response:**
\`\`\`typescript
ClassEnrollment
\`\`\`

**Particularidades:**
- Valida se a turma não está cheia
- Valida se o cliente já não está inscrito na mesma turma
- Incrementa automaticamente `currentStudents` da turma
- Atualiza status da turma para "full" se atingir capacidade máxima

#### PUT /api/enrollments/:id
Atualiza uma inscrição.

**Request Body:**
\`\`\`typescript
{
  status?: "active" | "inactive" | "suspended" | "cancelled"
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
ClassEnrollment
\`\`\`

**Particularidades:**
- Ao cancelar/inativar, decrementa `currentStudents` da turma
- Ao reativar, valida se há vagas disponíveis

#### DELETE /api/enrollments/:id
Remove uma inscrição.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

## Módulo Ficha de Treino (Workout)

### 1. Templates de Treino (Workout Templates)

#### GET /api/workout-templates
Lista todos os templates de treino.

**Query Parameters:**
\`\`\`typescript
{
  search?: string
  category?: "strength" | "cardio" | "flexibility" | "functional" | "mixed"
  difficulty?: "beginner" | "intermediate" | "advanced"
  isActive?: boolean
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: WorkoutTemplate[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/workout-templates/:id
Busca um template específico.

**Response:**
\`\`\`typescript
WorkoutTemplate
\`\`\`

#### POST /api/workout-templates
Cria um novo template de treino.

**Request Body:**
\`\`\`typescript
{
  name: string
  description?: string
  category: "strength" | "cardio" | "flexibility" | "functional" | "mixed"
  difficulty: "beginner" | "intermediate" | "advanced"
  exercises: Array<{
    exerciseId: string       // ID do exercício
    exerciseName: string     // Nome do exercício
    sets?: number            // Número de séries
    reps?: number            // Repetições por série
    duration?: number        // Duração em segundos (para cardio)
    rest?: number            // Descanso entre séries (segundos)
    weight?: number          // Peso sugerido (kg)
    notes?: string           // Observações
    order: number            // Ordem de execução
  }>
  estimatedDuration: number  // Duração estimada total (minutos)
}
\`\`\`

**Response:**
\`\`\`typescript
WorkoutTemplate
\`\`\`

#### PUT /api/workout-templates/:id
Atualiza um template.

**Request Body:** (todos os campos opcionais)
\`\`\`typescript
{
  name?: string
  description?: string
  category?: WorkoutCategory
  difficulty?: WorkoutDifficulty
  exercises?: WorkoutExercise[]
  estimatedDuration?: number
  isActive?: boolean
}
\`\`\`

**Response:**
\`\`\`typescript
WorkoutTemplate
\`\`\`

#### DELETE /api/workout-templates/:id
Remove um template.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 2. Planos de Treino (Workout Plans)

#### GET /api/workout-plans
Lista todos os planos de treino.

**Query Parameters:**
\`\`\`typescript
{
  search?: string
  clientId?: string
  instructorId?: string
  status?: "active" | "completed" | "cancelled"
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: ClientWorkoutPlan[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/workout-plans/:id
Busca um plano específico.

**Response:**
\`\`\`typescript
ClientWorkoutPlan & {
  client: Client
  instructor: User
  template?: WorkoutTemplate
  logs: WorkoutLog[]
}
\`\`\`

#### POST /api/workout-plans
Cria um novo plano de treino para um cliente.

**Request Body:**
\`\`\`typescript
{
  clientId: string
  instructorId: string
  templateId?: string          // Opcional: usar um template existente
  customExercises: WorkoutExercise[]  // Exercícios personalizados
  startDate: string
  endDate?: string
  goal?: string                // Objetivo do treino
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
ClientWorkoutPlan
\`\`\`

**Particularidades:**
- Se `templateId` for fornecido, copia os exercícios do template
- `customExercises` pode sobrescrever ou adicionar exercícios

#### PUT /api/workout-plans/:id
Atualiza um plano de treino.

**Request Body:**
\`\`\`typescript
{
  customExercises?: WorkoutExercise[]
  endDate?: string
  goal?: string
  notes?: string
  status?: "active" | "completed" | "cancelled"
}
\`\`\`

**Response:**
\`\`\`typescript
ClientWorkoutPlan
\`\`\`

#### DELETE /api/workout-plans/:id
Remove um plano de treino.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 3. Registro de Treinos (Workout Logs)

#### GET /api/workout-logs
Lista todos os registros de treinos.

**Query Parameters:**
\`\`\`typescript
{
  clientId?: string
  workoutPlanId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: WorkoutLog[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/workout-logs/:id
Busca um registro específico.

**Response:**
\`\`\`typescript
WorkoutLog
\`\`\`

#### POST /api/workout-logs
Registra um treino executado.

**Request Body:**
\`\`\`typescript
{
  clientId: string
  workoutPlanId: string
  date: string                 // Data do treino (ISO 8601)
  exercises: Array<{
    exerciseId: string
    exerciseName: string
    sets: Array<{
      setNumber: number
      reps?: number
      weight?: number
      duration?: number
      completed: boolean
    }>
    notes?: string
  }>
  duration: number             // Duração total (minutos)
  notes?: string
  rating?: number              // Avaliação 1-5
}
\`\`\`

**Response:**
\`\`\`typescript
WorkoutLog
\`\`\`

**Particularidades:**
- Usado para tracking de progresso
- Permite comparar performance ao longo do tempo

#### DELETE /api/workout-logs/:id
Remove um registro de treino.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 4. Evolução/Progresso (Progress)

#### GET /api/client-progress
Lista registros de evolução.

**Query Parameters:**
\`\`\`typescript
{
  clientId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: ClientProgress[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/client-progress/:id
Busca um registro específico.

**Response:**
\`\`\`typescript
ClientProgress
\`\`\`

#### GET /api/client-progress/client/:clientId/chart
Retorna dados formatados para gráfico de evolução.

**Response:**
\`\`\`typescript
{
  dates: string[]
  weight: number[]
  bodyFat: number[]
  muscleMass: number[]
  measurements: {
    chest: number[]
    waist: number[]
    hips: number[]
    biceps: number[]
    thighs: number[]
    calves: number[]
  }
}
\`\`\`

#### POST /api/client-progress
Registra uma nova medição de progresso.

**Request Body:**
\`\`\`typescript
{
  clientId: string
  date: string
  weight?: number              // Peso em kg
  bodyFat?: number             // Percentual de gordura
  muscleMass?: number          // Massa muscular em kg
  measurements?: {
    chest?: number             // Medidas em cm
    waist?: number
    hips?: number
    biceps?: number
    thighs?: number
    calves?: number
  }
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
ClientProgress
\`\`\`

#### DELETE /api/client-progress/:id
Remove um registro de progresso.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

## Módulo Guichê de Atendimento (Queue)

### 1. Senhas/Tickets (Queue Tickets)

#### GET /api/queue/tickets
Lista todas as senhas.

**Query Parameters:**
\`\`\`typescript
{
  status?: "waiting" | "called" | "in_service" | "completed" | "cancelled" | "no_show"
  priority?: "normal" | "priority" | "urgent"
  serviceType?: string
  date?: string                // Data específica (ISO 8601)
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: QueueTicket[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/queue/tickets/:id
Busca uma senha específica.

**Response:**
\`\`\`typescript
QueueTicket & {
  client: Client
  attendant?: User
}
\`\`\`

#### GET /api/queue/tickets/current
Lista senhas em espera (tempo real).

**Response:**
\`\`\`typescript
{
  waiting: QueueTicket[]
  inService: QueueTicket[]
  stats: {
    totalWaiting: number
    averageWaitTime: number
    estimatedWaitTime: number
  }
}
\`\`\`

**Particularidades:**
- Atualiza automaticamente a cada 5 segundos no frontend
- Ordena por prioridade e horário de check-in

#### POST /api/queue/tickets
Gera uma nova senha.

**Request Body:**
\`\`\`typescript
{
  clientId: string
  serviceType: string          // Tipo de serviço solicitado
  priority?: "normal" | "priority" | "urgent"  // Padrão: "normal"
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
QueueTicket
\`\`\`

**Particularidades:**
- Gera automaticamente `ticketNumber` sequencial (ex: "A001", "A002")
- Calcula `estimatedWaitTime` baseado na fila atual
- Define `checkInTime` automaticamente

#### PUT /api/queue/tickets/:id
Atualiza status de uma senha.

**Request Body:**
\`\`\`typescript
{
  status?: "waiting" | "called" | "in_service" | "completed" | "cancelled" | "no_show"
  attendantId?: string
  deskNumber?: string
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
QueueTicket
\`\`\`

**Particularidades:**
- Ao mudar para "called", define `calledTime`
- Ao mudar para "in_service", define `startServiceTime`
- Ao mudar para "completed", define `endServiceTime`

#### DELETE /api/queue/tickets/:id
Remove uma senha.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 2. Guichês (Queue Desks)

#### GET /api/queue/desks
Lista todos os guichês.

**Query Parameters:**
\`\`\`typescript
{
  status?: "available" | "busy" | "paused" | "offline"
  isActive?: boolean
}
\`\`\`

**Response:**
\`\`\`typescript
QueueDesk[]
\`\`\`

#### GET /api/queue/desks/:id
Busca um guichê específico.

**Response:**
\`\`\`typescript
QueueDesk & {
  attendant?: User
  currentTicket?: QueueTicket
}
\`\`\`

#### POST /api/queue/desks
Cria um novo guichê.

**Request Body:**
\`\`\`typescript
{
  deskNumber: string           // Número do guichê (ex: "01", "02")
  name: string                 // Nome do guichê
  serviceTypes: string[]       // Tipos de serviço atendidos
  attendantId?: string         // ID do atendente
}
\`\`\`

**Response:**
\`\`\`typescript
QueueDesk
\`\`\`

#### PUT /api/queue/desks/:id
Atualiza um guichê.

**Request Body:**
\`\`\`typescript
{
  deskNumber?: string
  name?: string
  serviceTypes?: string[]
  attendantId?: string
  status?: "available" | "busy" | "paused" | "offline"
  isActive?: boolean
}
\`\`\`

**Response:**
\`\`\`typescript
QueueDesk
\`\`\`

#### POST /api/queue/desks/:id/call-next
Chama próxima senha para o guichê.

**Request Body:**
\`\`\`typescript
{
  serviceType?: string         // Opcional: filtrar por tipo de serviço
}
\`\`\`

**Response:**
\`\`\`typescript
{
  ticket: QueueTicket
  desk: QueueDesk
}
\`\`\`

**Particularidades:**
- Busca próxima senha com prioridade mais alta
- Filtra por `serviceTypes` do guichê
- Atualiza status do guichê para "busy"
- Atualiza status da senha para "called"

#### POST /api/queue/desks/:id/complete-service
Finaliza atendimento atual.

**Response:**
\`\`\`typescript
{
  ticket: QueueTicket
  desk: QueueDesk
}
\`\`\`

**Particularidades:**
- Atualiza status da senha para "completed"
- Atualiza status do guichê para "available"
- Registra `endServiceTime`

#### DELETE /api/queue/desks/:id
Remove um guichê.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 3. Estatísticas da Fila (Queue Stats)

#### GET /api/queue/stats
Retorna estatísticas da fila.

**Query Parameters:**
\`\`\`typescript
{
  date?: string                // Data específica (padrão: hoje)
  startDate?: string           // Período inicial
  endDate?: string             // Período final
}
\`\`\`

**Response:**
\`\`\`typescript
{
  totalWaiting: number
  totalInService: number
  totalCompleted: number
  totalCancelled: number
  totalNoShow: number
  averageWaitTime: number      // Em minutos
  averageServiceTime: number   // Em minutos
  ticketsByPriority: {
    normal: number
    priority: number
    urgent: number
  }
  ticketsByStatus: {
    waiting: number
    called: number
    in_service: number
    completed: number
    cancelled: number
    no_show: number
  }
  ticketsByHour: Array<{
    hour: number
    count: number
  }>
}
\`\`\`

---

## Módulo Prontuário Médico (Medical Records)

### 1. Pacientes (Patients)

#### GET /api/patients
Lista todos os pacientes.

**Query Parameters:**
\`\`\`typescript
{
  search?: string              // Busca por nome ou microchip
  species?: string             // Filtrar por espécie
  ownerId?: string             // Filtrar por dono
  isActive?: boolean
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: Patient[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/patients/:id
Busca um paciente específico.

**Response:**
\`\`\`typescript
Patient & {
  owner: Client
}
\`\`\`

#### GET /api/patients/:id/history
Retorna histórico completo do paciente.

**Response:**
\`\`\`typescript
{
  patient: Patient
  totalRecords: number
  lastVisit?: string
  upcomingVaccines: Vaccine[]
  activeConditions: string[]
  recentRecords: MedicalRecord[]
}
\`\`\`

#### POST /api/patients
Cadastra um novo paciente.

**Request Body:**
\`\`\`typescript
{
  name: string
  species?: string             // Ex: "dog", "cat", "bird"
  breed?: string               // Raça
  gender?: "male" | "female"
  birthDate?: string           // Data de nascimento (ISO 8601)
  weight?: number              // Peso em kg
  color?: string               // Cor/pelagem
  microchip?: string           // Número do microchip
  ownerId: string              // ID do dono (cliente)
  allergies?: string[]         // Lista de alergias
  chronicConditions?: string[] // Condições crônicas
  bloodType?: string           // Tipo sanguíneo
}
\`\`\`

**Response:**
\`\`\`typescript
Patient
\`\`\`

#### PUT /api/patients/:id
Atualiza dados do paciente.

**Request Body:** (todos os campos opcionais)
\`\`\`typescript
{
  name?: string
  species?: string
  breed?: string
  gender?: "male" | "female"
  birthDate?: string
  weight?: number
  color?: string
  microchip?: string
  ownerId?: string
  allergies?: string[]
  chronicConditions?: string[]
  bloodType?: string
  isActive?: boolean
}
\`\`\`

**Response:**
\`\`\`typescript
Patient
\`\`\`

#### DELETE /api/patients/:id
Remove um paciente (soft delete).

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

---

### 2. Prontuários (Medical Records)

#### GET /api/medical-records
Lista todos os prontuários.

**Query Parameters:**
\`\`\`typescript
{
  search?: string
  patientId?: string
  recordType?: "consultation" | "exam" | "surgery" | "vaccination" | "emergency" | "follow_up"
  status?: "draft" | "completed" | "cancelled"
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: MedicalRecord[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/medical-records/:id
Busca um prontuário específico.

**Response:**
\`\`\`typescript
MedicalRecord & {
  patient: Patient
  veterinarian?: User
}
\`\`\`

#### POST /api/medical-records
Cria um novo prontuário.

**Request Body:**
\`\`\`typescript
{
  patientId: string
  recordType: "consultation" | "exam" | "surgery" | "vaccination" | "emergency" | "follow_up"
  date: string
  veterinarianId?: string
  chiefComplaint?: string      // Queixa principal
  anamnesis?: string           // Anamnese
  physicalExam?: string        // Exame físico
  diagnosis?: string           // Diagnóstico
  treatment?: string           // Tratamento
  prescriptions?: Array<{
    id: string
    medication: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }>
  exams?: Array<{
    id: string
    examType: string
    requestDate: string
    resultDate?: string
    result?: string
    attachments?: string[]
    notes?: string
  }>
  vaccines?: Array<{
    id: string
    vaccineName: string
    manufacturer?: string
    batchNumber?: string
    applicationDate: string
    nextDoseDate?: string
    veterinarianId?: string
    notes?: string
  }>
  procedures?: Array<{
    id: string
    procedureName: string
    description?: string
    duration?: number
    anesthesia?: boolean
    complications?: string
    notes?: string
  }>
  notes?: string
  nextAppointment?: string
}
\`\`\`

**Response:**
\`\`\`typescript
MedicalRecord
\`\`\`

**Particularidades:**
- Gera automaticamente `recordNumber` único
- Status inicial é "draft"
- Permite anexar arquivos (imagens, PDFs)

#### PUT /api/medical-records/:id
Atualiza um prontuário.

**Request Body:** (todos os campos opcionais)
\`\`\`typescript
{
  recordType?: RecordType
  date?: string
  veterinarianId?: string
  chiefComplaint?: string
  anamnesis?: string
  physicalExam?: string
  diagnosis?: string
  treatment?: string
  prescriptions?: Prescription[]
  exams?: Exam[]
  vaccines?: Vaccine[]
  procedures?: Procedure[]
  notes?: string
  nextAppointment?: string
  status?: "draft" | "completed" | "cancelled"
}
\`\`\`

**Response:**
\`\`\`typescript
MedicalRecord
\`\`\`

#### DELETE /api/medical-records/:id
Remove um prontuário.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

**Particularidades:**
- Apenas prontuários com status "draft" podem ser deletados
- Prontuários "completed" devem ser cancelados ao invés de deletados

---

## Módulo Trocas de Produtos (Exchange)

### 1. Trocas (Exchanges)

#### GET /api/exchanges
Lista todas as trocas.

**Query Parameters:**
\`\`\`typescript
{
  search?: string              // Busca por número da troca ou nome do cliente
  status?: "pending" | "completed" | "cancelled"
  customerId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
\`\`\`

**Response:**
\`\`\`typescript
{
  data: Exchange[]
  pagination: PaginationMeta
}
\`\`\`

#### GET /api/exchanges/:id
Busca uma troca específica.

**Response:**
\`\`\`typescript
Exchange & {
  originalItem: InventoryItem
  newItem: InventoryItem
  user: User
  transaction?: Transaction
}
\`\`\`

#### GET /api/exchanges/stats
Retorna estatísticas de trocas.

**Query Parameters:**
\`\`\`typescript
{
  startDate?: string
  endDate?: string
}
\`\`\`

**Response:**
\`\`\`typescript
{
  totalExchanges: number
  pendingExchanges: number
  completedExchanges: number
  cancelledExchanges: number
  totalValueDifference: number  // Soma das diferenças (positivo = cliente pagou)
  period: {
    start: string
    end: string
  }
}
\`\`\`

#### POST /api/exchanges
Registra uma nova troca.

**Request Body:**
\`\`\`typescript
{
  customerName: string
  customerId?: string          // Opcional: ID do cliente cadastrado
  originalItemId: string       // ID do produto original
  originalQuantity: number
  newItemId: string            // ID do novo produto
  newQuantity: number
  reason?: string              // Motivo da troca
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
Exchange
\`\`\`

**Particularidades:**
- Gera automaticamente `exchangeNumber` único (ex: "TRC-2024-0001")
- Calcula automaticamente `priceDifference`:
  - Positivo: cliente deve pagar a diferença
  - Negativo: cliente recebe reembolso/crédito
  - Zero: troca sem diferença de valor
- Valida se os produtos existem e têm estoque disponível
- Não permite trocar o mesmo produto (originalItemId !== newItemId)
- Status inicial é "pending"

#### PUT /api/exchanges/:id
Atualiza uma troca.

**Request Body:**
\`\`\`typescript
{
  status?: "pending" | "completed" | "cancelled"
  notes?: string
}
\`\`\`

**Response:**
\`\`\`typescript
Exchange
\`\`\`

**Particularidades:**
- Ao completar (status = "completed"):
  - Adiciona `originalQuantity` ao estoque do produto original
  - Remove `newQuantity` do estoque do novo produto
  - Se `priceDifference > 0`, cria uma transação financeira (pagamento)
  - Se `priceDifference < 0`, cria uma transação financeira (reembolso)
  - Define `completedAt`
- Ao cancelar (status = "cancelled"):
  - Define `cancelledAt`
  - Não altera estoques

#### DELETE /api/exchanges/:id
Remove uma troca.

**Response:**
\`\`\`typescript
{ success: true }
\`\`\`

**Particularidades:**
- Apenas trocas com status "pending" podem ser deletadas

---

## Módulo Dashboard

### 1. Dashboard Stats

#### GET /api/dashboard/stats
Retorna estatísticas gerais do dashboard.

**Query Parameters:**
\`\`\`typescript
{
  startDate?: string           // Período inicial (padrão: 30 dias atrás)
  endDate?: string             // Período final (padrão: hoje)
}
\`\`\`

**Response:**
\`\`\`typescript
{
  totalRevenue: number
  revenueChange: number        // Percentual de mudança vs período anterior
  totalAppointments: number
  appointmentsChange: number
  activeClients: number
  clientsChange: number
  lowStockItems: number
  stockChange: number
}
\`\`\`

#### GET /api/dashboard/revenue-chart
Retorna dados para gráfico de receita.

**Query Parameters:**
\`\`\`typescript
{
  period?: "week" | "month" | "year"  // Padrão: "month"
}
\`\`\`

**Response:**
\`\`\`typescript
{
  labels: string[]             // Datas ou períodos
  data: number[]               // Valores de receita
  total: number
  average: number
}
\`\`\`

#### GET /api/dashboard/appointments-status
Retorna distribuição de agendamentos por status.

**Response:**
\`\`\`typescript
{
  confirmed: number
  pending: number
  completed: number
  cancelled: number
  no_show: number
}
\`\`\`

#### GET /api/dashboard/top-services
Retorna serviços mais vendidos.

**Query Parameters:**
\`\`\`typescript
{
  limit?: number               // Padrão: 5
  startDate?: string
  endDate?: string
}
\`\`\`

**Response:**
\`\`\`typescript
Array<{
  serviceName: string
  count: number
  revenue: number
}>
\`\`\`

#### GET /api/dashboard/employee-performance
Retorna performance dos funcionários.

**Query Parameters:**
\`\`\`typescript
{
  limit?: number               // Padrão: 10
  startDate?: string
  endDate?: string
}
\`\`\`

**Response:**
\`\`\`typescript
Array<{
  employeeId: string
  employeeName: string
  appointmentsCompleted: number
  revenue: number
  averageRating: number
}>
\`\`\`

#### GET /api/dashboard/client-growth
Retorna crescimento de clientes ao longo do tempo.

**Query Parameters:**
\`\`\`typescript
{
  period?: "week" | "month" | "year"  // Padrão: "month"
}
\`\`\`

**Response:**
\`\`\`typescript
{
  labels: string[]
  newClients: number[]
  totalClients: number[]
}
\`\`\`

---

### 2. Dashboard Personalizado (Custom Dashboard)

#### GET /api/dashboard/layout
Retorna o layout personalizado do usuário.

**Response:**
\`\`\`typescript
{
  id: string
  userId: string
  widgets: Array<{
    id: string
    type: WidgetType
    title: string
    size: "small" | "medium" | "large" | "full"
    position: number
    visible: boolean
    config?: Record<string, any>
  }>
  createdAt: string
  updatedAt: string
}
\`\`\`

**Particularidades:**
- Se o usuário não tiver layout personalizado, retorna layout padrão

#### PUT /api/dashboard/layout
Atualiza o layout personalizado do usuário.

**Request Body:**
\`\`\`typescript
{
  widgets: Array<{
    id: string
    type: WidgetType
    title: string
    size: "small" | "medium" | "large" | "full"
    position: number
    visible: boolean
    config?: Record<string, any>
  }>
}
\`\`\`

**Response:**
\`\`\`typescript
DashboardLayout
\`\`\`

**Particularidades:**
- Salva as preferências do usuário
- Permite adicionar, remover e reordenar widgets

---

## Restaurante

### Mesas (Tables)

#### GET /api/tables
Lista mesas.

Response: Table[]

#### GET /api/tables/:id
Retorna uma mesa.

#### POST /api/tables
Cria uma mesa.

Request Body: CreateTableRequest

#### PATCH /api/tables/:id
Atualiza uma mesa.

Request Body: UpdateTableRequest

#### DELETE /api/tables/:id
Remove uma mesa.

### Pedidos (Orders)

#### GET /api/orders
Lista pedidos com paginação e filtro por status.

Query Parameters: `{ page?: number; limit?: number; status?: string }`

Response: { data: Order[]; pagination: PaginationMeta }

#### GET /api/orders/:id
Retorna um pedido.

#### POST /api/orders
Cria um pedido para mesa ou balcão.

Request Body: CreateOrderRequest

#### PATCH /api/orders/:id
Atualiza um pedido (status, pagamento, desconto, observações).

Request Body: UpdateOrderRequest

#### POST /api/orders/:orderId/items
Adiciona item ao pedido.

Request Body: AddOrderItemRequest

#### DELETE /api/orders/:orderId/items/:itemId
Remove item do pedido.

#### POST /api/orders/:id/close
Fecha o pedido (baixa financeira deve ser tratada pelo backend).

---

## Marketing

### Campanhas

#### GET /api/marketing/campaigns
Lista campanhas com filtros.

Query Parameters: MarketingFilters & `{ page?: number }`

#### GET /api/marketing/campaigns/:id
Retorna campanha.

#### POST /api/marketing/campaigns
Cria campanha.

#### PUT /api/marketing/campaigns/:id
Atualiza campanha.

#### DELETE /api/marketing/campaigns/:id
Remove campanha.

#### POST /api/marketing/campaigns/:id/send
Dispara envio da campanha.

#### POST /api/marketing/campaigns/:id/pause
Pausa a campanha.

#### POST /api/marketing/campaigns/:id/cancel
Cancela a campanha.

### Templates

#### GET /api/marketing/templates
Lista templates.

#### GET /api/marketing/templates/:id
Retorna template.

#### POST /api/marketing/templates
Cria template.

#### PUT /api/marketing/templates/:id
Atualiza template.

#### DELETE /api/marketing/templates/:id
Remove template.

### Cupons

#### GET /api/marketing/coupons
Lista cupons com filtros.

#### GET /api/marketing/coupons/:id
Retorna cupom.

#### POST /api/marketing/coupons
Cria cupom.

#### PUT /api/marketing/coupons/:id
Atualiza cupom.

#### DELETE /api/marketing/coupons/:id
Remove cupom.

#### POST /api/marketing/coupons/:code/validate
Valida um código de cupom.

---

## Metas

#### GET /api/goals
Lista metas.

#### GET /api/goals/:id
Retorna meta.

#### POST /api/goals
Cria meta.

Request Body: CreateGoalRequest

#### PUT /api/goals/:id
Atualiza meta.

Request Body: UpdateGoalRequest

#### DELETE /api/goals/:id
Remove meta.

#### POST /api/goals/bulk-delete
Remove várias metas.

Request Body: `{ ids: string[] }`

---

## Configurações

### Configurações da Empresa

#### GET /api/settings/company
Retorna configurações gerais da empresa.

Response: CompanySettings

#### PUT /api/settings/company
Atualiza configurações da empresa.

Request Body: UpdateCompanySettingsRequest

### Comissões (Padrões e Específicas)

#### GET /api/settings/commissions
Lista configurações de comissão.

Query Parameters: CommissionSettingFilters

Response: CommissionSetting[]

#### POST /api/settings/commissions
Cria configuração de comissão (por serviço e/ou funcionário, ou padrão).

Request Body: CreateCommissionSettingRequest

#### PUT /api/settings/commissions/:id
Atualiza configuração de comissão.

#### DELETE /api/settings/commissions/:id
Remove configuração de comissão.

---

## Assinaturas e Pagamentos

### Planos e Assinatura

#### GET /api/subscription/plans
Lista planos disponíveis.

Response: SubscriptionPlan[]

#### GET /api/subscription/current
Retorna a assinatura atual da empresa.

Response: Subscription

#### POST /api/subscription
Cria uma assinatura.

Request Body: CreateSubscriptionRequest

#### PATCH /api/subscription/:id
Atualiza uma assinatura (mudança de plano, auto-renovação, etc.).

Request Body: UpdateSubscriptionRequest

#### POST /api/subscription/:id/cancel
Cancela a assinatura (no fim do ciclo atual, conforme política).

### Pagamentos

#### GET /api/payments
Lista pagamentos (assinaturas ou avulsos).

Response: { data: Payment[]; pagination: PaginationMeta }

#### POST /api/payments
Cria um pagamento.

Request Body: CreatePaymentRequest

---

## Schemas do Banco de Dados

### Tabela: modalities

\`\`\`sql
CREATE TABLE modalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  max_students_per_class INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT modalities_company_name_unique UNIQUE(company_id, name)
);

CREATE INDEX idx_modalities_company ON modalities(company_id);
CREATE INDEX idx_modalities_active ON modalities(is_active);
\`\`\`

---

### Tabela: gym_classes

\`\`\`sql
CREATE TABLE gym_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES modalities(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_ids UUID[] NOT NULL,
  schedule JSONB NOT NULL,
  max_students INTEGER NOT NULL,
  current_students INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT gym_classes_dates_check CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT gym_classes_students_check CHECK (current_students <= max_students)
);

CREATE INDEX idx_gym_classes_company ON gym_classes(company_id);
CREATE INDEX idx_gym_classes_modality ON gym_classes(modality_id);
CREATE INDEX idx_gym_classes_status ON gym_classes(status);
CREATE INDEX idx_gym_classes_instructors ON gym_classes USING GIN(instructor_ids);
\`\`\`

---

### Tabela: class_enrollments

\`\`\`sql
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT enrollments_class_client_unique UNIQUE(class_id, client_id)
);

CREATE INDEX idx_enrollments_company ON class_enrollments(company_id);
CREATE INDEX idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_enrollments_client ON class_enrollments(client_id);
CREATE INDEX idx_enrollments_status ON class_enrollments(status);
\`\`\`

---

### Tabela: workout_templates

\`\`\`sql
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'functional', 'mixed')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  exercises JSONB NOT NULL,
  estimated_duration INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_templates_company ON workout_templates(company_id);
CREATE INDEX idx_workout_templates_category ON workout_templates(category);
CREATE INDEX idx_workout_templates_difficulty ON workout_templates(difficulty);
CREATE INDEX idx_workout_templates_active ON workout_templates(is_active);
\`\`\`

---

### Tabela: client_workout_plans

\`\`\`sql
CREATE TABLE client_workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id),
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  custom_exercises JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  goal TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT workout_plans_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_workout_plans_company ON client_workout_plans(company_id);
CREATE INDEX idx_workout_plans_client ON client_workout_plans(client_id);
CREATE INDEX idx_workout_plans_instructor ON client_workout_plans(instructor_id);
CREATE INDEX idx_workout_plans_status ON client_workout_plans(status);
\`\`\`

---

### Tabela: workout_logs

\`\`\`sql
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workout_plan_id UUID NOT NULL REFERENCES client_workout_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercises JSONB NOT NULL,
  duration INTEGER NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_logs_company ON workout_logs(company_id);
CREATE INDEX idx_workout_logs_client ON workout_logs(client_id);
CREATE INDEX idx_workout_logs_plan ON workout_logs(workout_plan_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(date);
\`\`\`

---

### Tabela: client_progress

\`\`\`sql
CREATE TABLE client_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  body_fat DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  measurements JSONB,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT progress_client_date_unique UNIQUE(client_id, date)
);

CREATE INDEX idx_client_progress_company ON client_progress(company_id);
CREATE INDEX idx_client_progress_client ON client_progress(client_id);
CREATE INDEX idx_client_progress_date ON client_progress(date);
\`\`\`

---

### Tabela: queue_tickets

\`\`\`sql
CREATE TABLE queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ticket_number VARCHAR(20) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  service_type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'priority', 'urgent')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_service', 'completed', 'cancelled', 'no_show')),
  check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  called_time TIMESTAMP,
  start_service_time TIMESTAMP,
  end_service_time TIMESTAMP,
  attendant_id UUID REFERENCES users(id),
  desk_number VARCHAR(10),
  notes TEXT,
  estimated_wait_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT tickets_company_number_unique UNIQUE(company_id, ticket_number)
);

CREATE INDEX idx_queue_tickets_company ON queue_tickets(company_id);
CREATE INDEX idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX idx_queue_tickets_priority ON queue_tickets(priority);
CREATE INDEX idx_queue_tickets_date ON queue_tickets(DATE(check_in_time));
\`\`\`

---

### Tabela: queue_desks

\`\`\`sql
CREATE TABLE queue_desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  desk_number VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  service_types TEXT[] NOT NULL,
  attendant_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'paused', 'offline')),
  current_ticket_id UUID REFERENCES queue_tickets(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT desks_company_number_unique UNIQUE(company_id, desk_number)
);

CREATE INDEX idx_queue_desks_company ON queue_desks(company_id);
CREATE INDEX idx_queue_desks_status ON queue_desks(status);
CREATE INDEX idx_queue_desks_active ON queue_desks(is_active);
\`\`\`

---

### Tabela: patients

\`\`\`sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(50),
  breed VARCHAR(100),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  weight DECIMAL(6,2),
  color VARCHAR(100),
  microchip VARCHAR(50),
  owner_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  blood_type VARCHAR(10),
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_company ON patients(company_id);
CREATE INDEX idx_patients_owner ON patients(owner_id);
CREATE INDEX idx_patients_species ON patients(species);
CREATE INDEX idx_patients_microchip ON patients(microchip);
CREATE INDEX idx_patients_active ON patients(is_active);
\`\`\`

---

### Tabela: medical_records

\`\`\`sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('consultation', 'exam', 'surgery', 'vaccination', 'emergency', 'follow_up')),
  record_number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  veterinarian_id UUID REFERENCES users(id),
  chief_complaint TEXT,
  anamnesis TEXT,
  physical_exam TEXT,
  diagnosis TEXT,
  treatment TEXT,
  prescriptions JSONB,
  exams JSONB,
  vaccines JSONB,
  procedures JSONB,
  notes TEXT,
  attachments TEXT[],
  next_appointment DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT records_company_number_unique UNIQUE(company_id, record_number)
);

CREATE INDEX idx_medical_records_company ON medical_records(company_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_date ON medical_records(date);
CREATE INDEX idx_medical_records_status ON medical_records(status);
\`\`\`

---

### Tabela: exchanges

\`\`\`sql
CREATE TABLE exchanges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange_number VARCHAR(50) NOT NULL,
  customer_id UUID REFERENCES clients(id),
  customer_name VARCHAR(255) NOT NULL,
  original_item_id UUID NOT NULL REFERENCES inventory_items(id),
  original_quantity INTEGER NOT NULL,
  original_total_value DECIMAL(10,2) NOT NULL,
  new_item_id UUID NOT NULL REFERENCES inventory_items(id),
  new_quantity INTEGER NOT NULL,
  new_total_value DECIMAL(10,2) NOT NULL,
  price_difference DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reason TEXT,
  notes TEXT,
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  CONSTRAINT exchanges_company_number_unique UNIQUE(company_id, exchange_number),
  CONSTRAINT exchanges_different_items CHECK (original_item_id != new_item_id)
);

CREATE INDEX idx_exchanges_company ON exchanges(company_id);
CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_exchanges_customer ON exchanges(customer_id);
CREATE INDEX idx_exchanges_date ON exchanges(DATE(created_at));
\`\`\`

---

### Tabela: dashboard_layouts

\`\`\`sql
CREATE TABLE dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widgets JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT dashboard_layouts_user_unique UNIQUE(user_id)
);

CREATE INDEX idx_dashboard_layouts_user ON dashboard_layouts(user_id);
\`\`\`

---

## Notas Gerais

### Autenticação
Todas as rotas requerem autenticação via JWT token no header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Paginação
Rotas que retornam listas seguem o padrão:
\`\`\`typescript
{
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
\`\`\`

### Erros
Formato padrão de erro:
\`\`\`typescript
{
  error: string
  message: string
  statusCode: number
  details?: any
}
\`\`\`

### Códigos HTTP
- 200: Sucesso
- 201: Criado com sucesso
- 400: Erro de validação
- 401: Não autenticado
- 403: Sem permissão
- 404: Não encontrado
- 409: Conflito (ex: duplicação)
- 500: Erro interno do servidor

### Soft Delete
Entidades importantes usam soft delete (is_active = false) ao invés de DELETE físico.

### Timestamps
Todas as tabelas incluem `created_at` e `updated_at` com atualização automática.

### Company Isolation
Todas as queries devem filtrar por `company_id` para garantir isolamento multi-tenant.
