# Contrato de backend para o módulo `clients`

Este arquivo descreve, de forma concentrada, todas as rotas e comportamentos que o frontend deste repositório espera do backend para suportar o fluxo de clientes (magic links, sessão de cliente e CRUD administrativo). Use-o como especificação ao implementar os endpoints `/clients`.

## Resumo rápido
- Prefixo de rotas: `/clients`
- Principais funcionalidades: geração de magic link, troca de token por JWT, endpoint `/clients/me`, CRUD administrativo de clientes.

## Rotas detalhadas

1) Geração do magic link
- POST `/clients/generate-link`
  - Body: { "email": string, "metadata"?: object }
  - Auth: público
  - Response 200: { "message": "link_sent" }
  - Ações: cria `client_tokens` com token opaco, envia e-mail com link `https://<app>/client/access?token=<token>`

2) Troca do token opaco por sessão JWT do cliente
- POST `/clients/exchange-token`
  - Body: { "token": string }
  - Auth: público
  - Response 200: { "token": "<jwt>", "refreshToken"?: "<refresh>", "client": { /* client payload */ } }
  - Erros: 400/401 quando inválido/expirado/já usado
  - Observação: transação atômica que marca `used=true` no `client_tokens` e gera JWT

3) Perfil do cliente (me)
- GET `/clients/me`
  - Auth: Bearer client JWT
  - Response 200: { data: Client }

4) Login tradicional de cliente (opcional)
- POST `/clients/login`
  - Body: { email, password }
  - Response 200: { token, refreshToken?, client }

5) Refresh token (opcional)
- POST `/clients/refresh`
  - Body: { refreshToken }
  - Response 200: { token, refreshToken? }

6) CRUD administrativo (protegido por token staff)
- GET `/clients` → filtros: search?, page?, limit?, companyId? → PaginatedResponse<Client>
- GET `/clients/:id` → ApiResponse<Client>
- POST `/clients` → CreateClientRequest → ApiResponse<Client>
- PUT `/clients/:id` → UpdateClientRequest → ApiResponse<Client>
- DELETE `/clients/:id` → ApiResponse<void>
- POST `/clients/bulk-delete` → { ids: string[] } → ApiResponse<void>

7) Rotas auxiliares (recomendadas)
- POST `/clients/:id/generate-link` (admin-triggered link)
- GET `/clients/:id/bookings` (listar agendamentos)

## Banco de dados / Migrations
- `clients` (id, company_id, email, phone, name, profile jsonb, created_at, updated_at)
- `client_tokens` (id, client_id, token, type, metadata jsonb, used boolean, expires_at, created_at)

## Segurança e operações atômicas
- A troca do token deve ser atômica: verificar `used=false` e `expires_at > now()` e então marcar `used=true` e gerar sessão.
- Logar uso de token (IP, UA). Rate limit nas rotas públicas.

## Formatos de resposta (exemplos)

Exchange success example:

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

GET /clients/me example:

```json
{
  "data": { "id": "uuid", "company_id": "uuid", "email": "jane@example.com", "name": "Jane", "profile": {} }
}
```

## Integração com o frontend existente
- O frontend usa `localStorage.client_token` e `localStorage.client_user` para isolar sessão de cliente da sessão administrativa.
- O frontend espera os endpoints acima exatamente como descritos (ou que o backend implemente adaptações equivalentes).

---

Se desejar, eu posso gerar rapidamente exemplos de controller/handler (Express/Koa/Nest) e as migrations SQL correspondentes para acelerar a implementação no backend.
