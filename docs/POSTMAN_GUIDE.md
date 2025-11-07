# Postman Guide

This guide helps you test the HM Management API using Postman with environments, variables, and simple scripts to handle authentication automatically.

## 1) Prerequisites

- Postman (latest desktop app recommended)
- API base URL (default during local dev): `http://localhost:3001/api`
- A valid user (email/password) or an invitation token for onboarding

## 2) Create a Postman Environment

Create an environment named, for example, "HM Management (Local)" and add these variables:

- baseUrl: `http://localhost:3001/api`
- email: your login email (optional)
- password: your password (optional)
- accessToken: empty initially
- refreshToken: empty initially
- companyId: empty initially (will be decoded from JWT)
- userId: empty initially (will be decoded from JWT)

You can also import this environment JSON (optional):

```json
{
  "id": "hm-env-local",
  "name": "HM Management (Local)",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:3001/api", "type": "default", "enabled": true },
    { "key": "email", "value": "admin@example.com", "type": "default", "enabled": true },
    { "key": "password", "value": "secret123", "type": "secret", "enabled": true },
    { "key": "accessToken", "value": "", "type": "default", "enabled": true },
    { "key": "refreshToken", "value": "", "type": "default", "enabled": true },
    { "key": "companyId", "value": "", "type": "default", "enabled": true },
    { "key": "userId", "value": "", "type": "default", "enabled": true }
  ]
}
```

## 3) Collection Setup (Authorization)

For all authenticated routes, include only this header:

- Authorization: `Bearer {{accessToken}}`

Important: Tenant is derived from the JWT (Authorization). Do not send companyId in headers, query params, or request bodies. Send only the business parameters required by each endpoint (filters, pagination, ids, etc.).

You can set Authorization at the Collection level ("Bearer Token" with token `{{accessToken}}`).

## 4) Auth Flow Requests

The frontend expects these endpoints and response shapes. Use them the same way in Postman.

### 4.1 Login

- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```
- Tests (save tokens, decode companyId/userId):
```javascript
const json = pm.response.json();
const data = json.data || json; // ApiResponse wrapper vs raw

// Support nested token: { token: { token, refreshToken? } }
if (data && data.token && typeof data.token === 'object' && data.token.token) {
  pm.environment.set('accessToken', data.token.token);
  if (data.token.refreshToken) pm.environment.set('refreshToken', data.token.refreshToken);
} else if (data && data.token) {
  // Legacy flat shape
  pm.environment.set('accessToken', data.token);
  if (data.refreshToken) pm.environment.set('refreshToken', data.refreshToken);
}

// Decode JWT to extract companyId and userId (sub)
function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const access = pm.environment.get('accessToken');
if (access) {
  try {
    const payload = parseJwt(access);
    if (payload.companyId) pm.environment.set('companyId', payload.companyId);
    if (payload.userId) pm.environment.set('userId', payload.userId);
    else if (payload.sub) pm.environment.set('userId', String(payload.sub));
  } catch (e) {}
}

pm.test('Login succeeded', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));
```

### 4.2 Get Current User (by id)

- Method: POST
- URL: `{{baseUrl}}/users/get`
- Headers:
  - Authorization: `Bearer {{accessToken}}`
- Body (JSON): `{ "id": "{{userId}}" }`

### 4.3 Refresh Token

- Method: POST
- URL: `{{baseUrl}}/auth/refresh`
- Body (JSON):
```json
{
  "refreshToken": "{{refreshToken}}"
}
```
- Tests:
```javascript
const json = pm.response.json();
const data = json.data || json;
if (data && data.token) {
  pm.environment.set('accessToken', data.token);
}
pm.test('Refresh succeeded', () => pm.expect(pm.response.code).to.equal(200));
```

### 4.4 Accept Invite (public onboarding)

- Method: POST
- URL: `{{baseUrl}}/auth/accept-invite`
- Body (JSON):
```json
{
  "inviteToken": "<the_invite_token_here>",
  "name": "Optional Name",
  "password": "new-strong-password"
}
```
- Tests:
```javascript
const json = pm.response.json();
const data = json.data || json;
// Support nested token on accept-invite too
if (data && data.token && typeof data.token === 'object' && data.token.token) {
  pm.environment.set('accessToken', data.token.token);
  if (data.token.refreshToken) pm.environment.set('refreshToken', data.token.refreshToken);
} else if (data && data.token) {
  pm.environment.set('accessToken', data.token);
  if (data.refreshToken) pm.environment.set('refreshToken', data.refreshToken);
}

// Decode to set companyId/userId
function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}
const access = pm.environment.get('accessToken');
if (access) {
  try {
    const payload = parseJwt(access);
    if (payload.companyId) pm.environment.set('companyId', payload.companyId);
    if (payload.userId) pm.environment.set('userId', payload.userId);
    else if (payload.sub) pm.environment.set('userId', String(payload.sub));
  } catch (e) {}
}
pm.test('Accept invite succeeded', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));
```

## 5) Invitations (IAM)

The following endpoints require an authenticated admin/manager (depending on permissions). All parameters go in the body.

### 5.1 List Invitations (token-only tenant)
- Method: POST
- URL: `{{baseUrl}}/iam/invitations/list`
- Headers: Authorization Bearer
- Body (JSON): `{ "page": 1, "limit": 20, "search": "", "status": "pending" }`

### 5.2 Create Invitation
- Method: POST
- URL: `{{baseUrl}}/iam/invitations`
- Headers: Authorization Bearer
- Body (JSON): `{ "email": "user@example.com", "name": "User Optional Name", "role": "employee", "positionId": "<uuid-optional>" }`

### 5.3 Resend Invitation
- Method: POST
- URL: `{{baseUrl}}/iam/invitations/resend`
- Headers: Authorization Bearer
- Body (JSON): `{ "id": "<invitation-id>" }`

### 5.4 Revoke/Delete Invitation
- Method: POST
- URL: `{{baseUrl}}/iam/invitations/delete`
- Headers: Authorization Bearer
- Body (JSON): `{ "id": "<invitation-id>" }`

## 6) Users (token-only tenant)

- List: POST `{{baseUrl}}/users/list`
  - Body: `{ "page": 1, "limit": 10, "search": "", "role": "", "status": "", "positionId": "" }`
- Get by id: POST `{{baseUrl}}/users/get`
  - Body: `{ "id": "<user-id>" }`
- Create: POST `{{baseUrl}}/users`
  - Body: `{ /* CreateUserRequest fields... */ }`
- Update: PATCH `{{baseUrl}}/users/:id`
  - Body: `{ /* UpdateUserRequest fields... */ }`
- Update status: POST `{{baseUrl}}/users/status`
  - Body: `{ "id": "<user-id>", "status": "active|inactive|on_leave" }`
- Delete: POST `{{baseUrl}}/users/delete`
  - Body: `{ "id": "<user-id>" }`

## 7) Positions (token-only tenant)

- List: POST `{{baseUrl}}/positions/list`
  - Body: `{ "page": 1, "limit": 50 }`
- Get by id: POST `{{baseUrl}}/positions/get`
  - Body: `{ "id": "<position-id>" }`
- Create: POST `{{baseUrl}}/positions`
  - Body: `{ /* CreatePositionRequest fields */ }`
- Update: PATCH `{{baseUrl}}/positions/:id`
  - Body: `{ /* UpdatePositionRequest fields */ }`
- Delete: POST `{{baseUrl}}/positions/delete`
  - Body: `{ "id": "<position-id>" }`

## 8) Using Pre-request Scripts (optional)

You can add a Collection-level Pre-request Script to auto-attach the Authorization header when it exists:

```javascript
const token = pm.environment.get('accessToken');
if (token) {
  pm.request.headers.add({ key: 'Authorization', value: `Bearer ${token}` });
}
```

Note: All other parameters (including companyId) must be included in the request body of each call.

## 9) Troubleshooting

- 401/403 on protected routes:
  - Ensure you’ve run Login or Accept Invite and saved `accessToken`
  - Verify the Authorization header is present and correct (no extra spaces)
  - If the access token might be expired, run Refresh and try again
- 422/400 on create/update requests: Check your JSON body matches the API model
- CORS errors: Use the desktop Postman app or fix server CORS settings

## 10) Tips

- Save example responses in Postman for quick reference
- Use separate environments for Local, Staging, and Production (different `baseUrl` and credentials)
- Parameterize pagination and filters as variables if you reuse them often
