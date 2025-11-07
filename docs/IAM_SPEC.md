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
