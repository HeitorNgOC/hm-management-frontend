# IAM Spec (Entities, Postgres schema, and Routes)

This document consolidates the IAM model for implementers. It references the actual frontend types by file, proposes a PostgreSQL schema, and lists the expected routes and payloads used by the app.

## Entities by file

- `lib/types/auth.ts`
  - UserRole: "ADMIN" | "MANAGER" | "EMPLOYEE" | "CUSTOMER"
  - UserStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  - Permission: union of permission strings used across modules
  - AuthResponse: { user: User; token: string; refreshToken?: string }
  - User (auth-context shape): id, email, name, role, status, companyId, positionId?, permissions[], timestamps

- `lib/types/user.ts`
  - User: includes companyId, position relation, role: "admin" | "manager" | "employee", status: "active" | "inactive" | "on_leave"
  - Position: id, name, description?, permissions[]
  - CreateUserRequest, UpdateUserRequest, UserFilters

- `lib/types/iam.ts`
  - Invitation: id, companyId, email, name?, role?, positionId?, token, status, expiresAt, acceptedAt?, createdAt, createdBy?
  - InvitationStatus: "pending" | "accepted" | "expired" | "revoked"
  - CreateInvitationRequest: { email; name?; role?; positionId? }
  - InvitationFilters: { search?; status? }
  - AcceptInviteRequest: { inviteToken; name?; password }

- `lib/types/company.ts` (if present)
  - Company: id, name, slug, cnpj?, phone?, email?, address?, settings?, createdAt, updatedAt

- `lib/types/position.ts` (if present)
  - Position: id, name, description?, permissions[]

Note on roles: the app currently has two role unions (uppercase in `auth.ts`, lowercase in `user.ts`). Backends should pick one canonical representation at the API boundary and, if needed, translate internally.

## PostgreSQL schema (reference)

Suggested normalized tables and constraints for IAM with multi-tenancy via company_id.

```sql
-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  email text,
  phone text,
  cnpj text,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Positions (roles within a company) with permission set
create table positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

-- Users (employees). Use a single canonical role enum.
create type user_role as enum ('ADMIN','MANAGER','EMPLOYEE','CUSTOMER');
create type user_status as enum ('ACTIVE','INACTIVE','SUSPENDED');

create table users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  position_id uuid references positions(id) on delete set null,
  email text not null,
  name text not null,
  phone text,
  cpf text,
  role user_role not null default 'EMPLOYEE',
  status user_status not null default 'ACTIVE',
  permissions text[] not null default '{}', -- optional per-user grants/overrides
  password_hash text not null,
  avatar text,
  hire_date date,
  salary numeric,
  commission numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email)
);

-- Invitations
create type invitation_status as enum ('pending','accepted','expired','revoked');

create table invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  name text,
  role user_role,                    -- optional: target role
  position_id uuid references positions(id) on delete set null,
  token text not null unique,
  status invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null
);

create index on users(company_id);
create index on positions(company_id);
create index on invitations(company_id);
create index on invitations(status);

-- Clients (end users / customers) --
-- There are two common approaches: A) represent customers as `users` with role CUSTOMER
--    B) keep a separate `clients` table linked to a user account or using independent credentials/tokens.
-- Both are supported below; choose the one that best fits your business model.

-- Option A: Use existing users table with a CUSTOMER role
-- (simple, leverages existing auth/session and permissions)
-- If chosen, ensure frontend/backend treat CUSTOMER as a limited role (no internal permissions by default).

-- Option B: Dedicated clients table (recommended when clients have different profile shape or lifecycle)
create table clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text,
  phone text,
  name text,
  cpf text,
  cnpj text,
  profile jsonb default '{}'::jsonb, -- arbitrary client-visible data (preferences, training plan pointers, etc)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email)
);

-- Token table for scheduling / magic links (one-time or short-lived)
create table client_tokens (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  token text not null unique,
  type text not null, -- e.g. 'magic_link' | 'scheduling_link'
  metadata jsonb default '{}'::jsonb,
  used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
```

Key invariants:
- Enforce tenant isolation via company_id on all tables and queries.
- Ensure at least one ADMIN remains active per company when deactivating/removing users.
- Invitations expire automatically; revoke invalidates immediately.

## Routes

Base: `/api`

### Auth
- POST `/auth/login` → { email, password } => AuthResponse
- POST `/auth/logout` → void
- GET `/auth/me` → { data: User }
- POST `/auth/refresh` → { refreshToken } => { token }
- POST `/auth/forgot-password` → { email }
- POST `/auth/reset-password` → { token, newPassword }
- POST `/auth/verify-email` → { token }
- POST `/auth/accept-invite` → { inviteToken, name?, password } => AuthResponse
- (Legacy/disabled) POST `/auth/register` → { email, password, name, companyName } => AuthResponse

### Client Access (customers)

Clients should be able to access the platform in two primary ways:

- Normal login (email + password) if they have credentials (either because they were created as `users` with role CUSTOMER or they registered via an onboarding flow).
- Magic/scheduling link: they receive a time-limited tokenized link (e.g. `/client/access?token=...`) which allows immediate access to the client-facing area without a password. These links should be single-use or short-lived and recorded in `client_tokens`.

Recommended routes for client access (when using dedicated `clients` + `client_tokens`):

- POST `/client/auth/login` → { email, password } => { token, client }
- POST `/client/auth/token-exchange` → { token } => { token: bearerJwt, client }  // consumes `client_tokens` entry
- GET `/client/me` → { data: Client } (authenticated by client JWT)
- POST `/client/auth/refresh` → { refreshToken } => { token }

Scheduling / magic link flow:

1. The server generates a single-use token row in `client_tokens` with type `scheduling_link`, `expires_at` short (e.g. 1 hour), and metadata { appointmentId }.
2. The user receives a link: `https://yourapp.com/client/access?token=<token>`.
3. Client frontend sends token to `/client/auth/token-exchange` which validates token, marks it used (or immediately expires), and returns a client JWT session.
4. Client is redirected to the booking view or client dashboard and can continue with an authenticated session. Tokens must be single-use and logged.

Permissions and UX notes:
- Clients generally should not receive the same permissions as staff. Define a minimal permission set (e.g., `client.view_bookings`, `client.manage_payments`, `client.view_workouts`) if you plan to gate features by permission.
- Alternatively, treat clients as a role `CUSTOMER` within the `user_role` enum and map UI gates for customers to a small subset of the app. This simplifies session model at the cost of mixing employee and client concerns in one table.
- Record consent and privacy choices on the `clients.profile` JSONB to support GDPR-like requirements.

Security recommendations:
- Magic/scheduling links must be single-use or set to `used = true` once exchanged. Keep `expires_at` short (minutes to hours) depending on sensitivity.
- Do not include sensitive data in the token string; store metadata server-side and return only an opaque token.
- For client JWTs consider a separate claim (e.g. `subType: 'client'`) so backend can enforce different rate-limits and session rules.


### IAM / Invitations
- GET `/iam/invitations` → query: page, limit, search?, status? → PaginatedResponse<Invitation>
- GET `/iam/invitations/:id` → ApiResponse<Invitation>
- POST `/iam/invitations` → CreateInvitationRequest → ApiResponse<Invitation>
- POST `/iam/invitations/:id/resend` → ApiResponse<void>
- DELETE `/iam/invitations/:id` → ApiResponse<void>

### Users
- GET `/users` → filters: search?, role?, status?, positionId?, page, limit → PaginatedResponse<User>
- GET `/users/:id` → ApiResponse<User>
- POST `/users` → CreateUserRequest → ApiResponse<User>
- PATCH `/users/:id` → UpdateUserRequest → ApiResponse<User>
- PATCH `/users/:id/status` → { status } → ApiResponse<User>
- DELETE `/users/:id` → ApiResponse<void>

### Positions
- GET `/positions` → page, limit → PaginatedResponse<Position>
- GET `/positions/:id` → ApiResponse<Position>
- POST `/positions` → { name, description?, permissions[] } → ApiResponse<Position>
- PATCH `/positions/:id` → partial fields → ApiResponse<Position>
- DELETE `/positions/:id` → ApiResponse<void>

### Company
- GET `/company` → ApiResponse<Company>
- PATCH `/company` → Partial<Company> → ApiResponse<Company>

## Notes for implementers

- JWT payload should include: userId, companyId, role, iat, exp. Frontend expects a Bearer token and a refresh flow at `/auth/refresh`.
- Official onboarding flow is via invitations. The first tenant admin is mocked outside public flows; `/auth/register` should remain disabled in multi-tenant mode.
- Email uniqueness should be at least per company; global uniqueness is recommended if feasible.
- Permissions are strings; the UI expects them on the user entity and on positions. A common pattern is to take permissions = position.permissions ∪ user.permissions.

## Client implementation checklist (developer guidance)

- Decide modeling approach: `users` with role `CUSTOMER` vs dedicated `clients` table.
- If dedicated `clients` table: implement `client_tokens` for magic links and update backend auth to support `/client/auth/token-exchange`.
- Add frontend routes/components:
  - `/client/access?token=` — exchange token and redirect to client dashboard.
  - client login page and client dashboard view (limited UI surface).
- Define minimal client permission set or gate features by role. Keep server-side checks conservative.
  - Define minimal client permission set or gate features by role. Keep server-side checks conservative.

### Frontend contract (implemented in this frontend repo)

The frontend in this repository expects the following client endpoints and behavior (used by `ClientAuthProvider` and `clientService`):

- POST `/clients/generate-link` → { email } → 200 OK on success (server sends the magic link via email)
- POST `/clients/exchange-token` → { token } → { token: bearerJwt, client }  // token is the opaque magic token; response returns client JWT and the client object
- GET `/clients/me` → returns client profile object (this endpoint is protected by client JWT)

Notes:
- The frontend stores client session in `localStorage` keys `client_token` and `client_user` to avoid overwriting the admin session. If you adopt a single `users` model instead, adapt the frontend to reuse the main auth flow.
- If you use the `client_tokens` approach, ensure `/clients/exchange-token` marks tokens used and enforces expiration.
- Add migrations for `clients` and `client_tokens`, and update seed data/process to create sample client accounts for QA.


## Rotas adicionais necessárias (detalhado)

O backend ainda precisa implementar os endpoints do módulo `clients` para suportar o fluxo de magic-link, sessão de cliente e operações administrativas. Abaixo está uma lista completa e prática para desenvolvimento.

1) Magic / scheduling link
- POST `/clients/generate-link`
  - Body: { email: string, metadata?: object }
  - Auth: público
  - Action: cria entrada em `client_tokens` e envia e-mail com `https://<app>/client/access?token=<token>`
  - Response 200: { message: 'link_sent' }

- POST `/clients/exchange-token`
  - Body: { token: string }
  - Auth: público
  - Action: valida token opaco, marca `used=true` (transacional), gera JWT do cliente e retorna client
  - Response 200: { token: '<jwt>', refreshToken?: '<refresh>', client: Client }
  - Error 400/401: token inválido/expirado/já usado

2) Sessão do cliente
- GET `/clients/me` (Auth: Bearer client JWT) → { data: Client }
- POST `/clients/refresh` (opcional) → { refreshToken } => { token, refreshToken? }
- POST `/clients/login` (opcional) → { email, password } => { token, refreshToken?, client }

3) CRUD administrativo (protegido)
- GET `/clients` → PaginatedResponse<Client> (filtros: search?, page?, limit?, companyId?)
- GET `/clients/:id` → ApiResponse<Client>
- POST `/clients` → ApiResponse<Client>
- PUT `/clients/:id` → ApiResponse<Client>
- DELETE `/clients/:id` → ApiResponse<void>
- POST `/clients/bulk-delete` → { ids: string[] } → ApiResponse<void>

4) Helpers
- POST `/clients/:id/generate-link` (admin-triggered)
- GET `/clients/:id/bookings` (listar agendamentos)

5) Regras de segurança
- Troca de token deve ser atômica: verificar `used=false` e `expires_at > now()` e marcar `used=true` em transação.
- Registrar auditoria (IP, UA) e aplicar rate limits nas rotas públicas.

6) Exemplos de resposta
Exchange success:

```json
{
  "token": "eyJhbGciOiJI...",
  "refreshToken": "optional-refresh-token",
  "client": {
    "id": "uuid",
    "company_id": "uuid",
    "email": "jane@example.com",
    "name": "Jane",
    "phone": "+55...",
    "profile": {}
  }
}
```

GET `/clients/me` example:

```json
{ "data": { "id": "uuid", "company_id": "uuid", "email": "jane@example.com", "name": "Jane", "profile": {} } }
```

7) Migrations mínimas
- `clients` (id, company_id, email, phone, name, profile jsonb, created_at, updated_at)
- `client_tokens` (id, client_id, token, type, metadata jsonb, used boolean, expires_at, created_at)

8) Integração com frontend
- O frontend atual salva `localStorage.client_token` e `localStorage.client_user` e depende dos endpoints acima.

Com estas rotas implementadas o frontend poderá suportar o ciclo completo: solicitar link → trocar token → sessão do cliente → área de cliente.
