# Requisitos do Sistema — HM Management

Este documento descreve os requisitos funcionais e não-funcionais do sistema de gestão multi-vertical (restaurante, salão/barbearia, academia, loja/mercado, etc.). O objetivo é fornecer um mapa completo das funcionalidades presentes e das que devem ser implementadas no futuro, incluindo detalhes de UI, dados, regras de negócio e casos de erro.

Sumário
- Visão geral
- Modelos conceituais-chave
- Papéis e cargos
- Requisitos não-funcionais
- Requisitos funcionais (ordenados por prioridade)
  - Core: Empresa, Usuários, Autenticação
  - Configurações (painel de administração)
  - Agendamentos / Appointments
  - Restaurante (Mesas / Pedidos / Cardápio)
  - Estoque / Inventory
  - Pagamentos / Subscriptions
  - Financeiro / Caixa
  - Marketing / Notificações
  - Relatórios e Auditoria
  - Integrações e Webhooks
- Regras de negócio, validações e erros
- Fluxos que ainda podem não estar implementados
- Dados de seed / migração sugeridos
- Métricas e observabilidade

## Visão geral
O sistema é multi-tenant por empresa (Company). Cada empresa tem um `CompanyType` que direciona quais features e UX aparecem. As features podem ser ativadas/desativadas por empresa via `CompanyFeature`.

Objetivos principais:
- Permitir que cada empresa ative funcionalidades relevantes ao seu negócio.
- Fornecer uma área administrativa para configuração geral e granular (cores, horários, taxa de serviço, integrações).
- Garantir regras claras de permissão: apenas `ADMIN` tem controle da empresa; `EMPLOYEE` realiza ações operacionais; `USER` é cliente final.
- Adicionar conceito de cargo/função (role granularity): dentro de `EMPLOYEE` existe `position` (ex: barista, cozinheiro, barbeiro) que controla permissões operacionais mais finas.

## Modelos conceituais-chave (resumido)
- Company
- CompanyType (RESTAURANTE, ACADEMIA, SALAO, MERCADO...)
- Feature
- User (campos: id, email, name, role (ADMIN|EMPLOYEE|USER), positions: string[]?, companyId?)
- Employee (dados específicos: workingHours, breaks, commissionRate)
- Appointment
- Service
- Table, Order, Menu, MenuItem, Recipe
- InventoryItem, InventoryTransaction
- Payment, Subscription
- CashRegister, Transaction
- Notification, MarketingCampaign

## Papéis e cargos
- ADMIN: dono/administrador da empresa. Pode gerenciar configurações, usuários, financials e features.
- EMPLOYEE: funcionário operacional. Tem um conjunto de permissões controladas por `position`/`cargo`.
- USER: cliente final/consumidor.

Cargo / Função (novo detalhe):
- Cada `EMPLOYEE` possui 0..N cargos/funções (ex: "Barbeiro", "Recepção", "Cozinha").
- Cada cargo mapeia para permissões mais finas (ex: `canCreateOrders`, `canCloseCashRegister`, `canManageAppointments`).
- O sistema deve expor um CRUD para `Positions` dentro das configurações da empresa.

## Requisitos não-funcionais
- Autenticação: NextAuth com JWT. Tokens curtos e refresh via estratégia segura.
- Persistência: Prisma + Postgres/SQLite (dev). Sempre usar cliente único (`prismadb`).
- Rate limiting: middleware para endpoints sensíveis (`authRateLimiter`, `apiRateLimiter`).
- Observabilidade: logs estruturados, métricas (requests, latência, erros), tracing básico para operações longas (ex: sincronização de estoque).
- Segurança: CSRF/SSO considerations, proteção para endpoints webhooks (validar assinatura), criptografia de segredos e variáveis de ambiente.
- Performance: APIs paginadas, índices em campos `companyId`, `email`, `externalId`.
- Escalabilidade: designs sem bloqueio para background jobs (ex: consumo de receitas, reconciliação de pagamentos).

## Requisitos funcionais (ordenados por prioridade)
Nota: cada item especifica UI/UX, dados, validações, erros e edge-cases.

### 1) Core: Company & Users
- Objetivo: Gerenciar empresas, time, features e permissões.
- UI: Página `Configurações > Empresa`.
  - Card superior (informações da empresa):
    - Nome da empresa (string)
    - CNPJ/ID fiscal (string)
    - Tipo (CompanyType)
    - Endereço (logradouro, número, cidade, estado, CEP)
    - Telefone de contato
    - Horário de funcionamento padrão (ex: 09:00 - 18:00)
    - Fuso horário
    - Status da conta (Ativa/Suspensa)
    - Plano/Assinatura atual (ex: Básico / Pro)
    - Data de criação e último acesso
  - Abaixo, tabs:
    1. Empresa (configs gerais)
       - Nome, descrição, logo (upload), endereço, timezone.
       - Validação: CNPJ único quando aplicável.
    2. Segurança
       - Password policy (min length), MFA obrigatório (toggle), sessões simultâneas permitidas.
       - Audit log toggle (ativar gravação extra para auditoria).
    3. Branding & Cores
       - Primary color, secondary color, logo, favicon, CSS custom (safe sandbox).
       - Aplicar preview em tempo real.
    4. Notificações
       - Email sender, SMS provider, toggles para eventos (novas reservas, pagamentos falhados, fechamento de caixa).
    5. Features
       - Lista de Features disponíveis com toggle (activar/desactivar) e descrição.
       - Detalhe de dependências entre features (ex: Restaurante -> exige Inventory para controle de ingredientes).
    6. Integrações
       - Stripe, Google Calendar, Twilio, Webhooks (configuração de endpoint + secret), relatórios externos (CSV/SFTP).

- Dados/Backend:
  - Endpoint para atualizar `company` (validar permissões ADMIN), persistir `CompanyFeature`.
  - Ao ativar feature que exige dados (ex: Restaurante) mostrar wizard para criar mesas/menu iniciais.

- Regras/Edge-cases:
  - Só ADMIN pode alterar `Plan`, `CompanyType` e toggles de segurança.
  - Ao trocar `CompanyType`, sugerir migração de dados (ex: habilitar campos de `Service` vs `Menu`).
  - Validação: timezone correta, upload de logo limitado a 2MB e tipos seguros.

### 2) Autenticação & Usuários
- Login, recuperação de senha, convite por e-mail.
- Sessões JWT com claims: { id, email, role, companyId, positions[], profileCompleted }
- Usuário convidado: link expirável para cadastro e definição de função.
- Admins podem criar Employees com funções e permissões específicas.
- Regras: não existe mais `MASTER`; toda administração é feita por `ADMIN`. Se for necessário suporte-platform, criar área de suporte via contas administrativas organizadas fora do modelo de `company`.

### 3) Configurações (painel de administração) — detalhado
- Página principal de Configurações: card superior com informações do sistema (ver acima). Abaixo, tabs com formulários.
- Tab: Configuração da empresa
  - Campos: Nome, tipo, endereço, hora de funcionamento padrão, timezone, idioma padrão.
  - Validações: campos obrigatórios, formatos (CEP, telefone), checagem de duplicidade de CNPJ.
- Tab: Configuração de segurança
  - MFA (off / optional / required), Password policy, bloqueio por tentativas, whitelist/blacklist de IPs.
- Tab: Configuração de cores e branding
  - Paleta, logo, upload de imagens, preview para e-mails e app.
- Tab: Notificações
  - Definir templates de e-mail (head/foot), toggles por evento, prioridade (critical/normal), retry policy para falha de envio.
- Tab: Integrações
  - Stripe: chave pública/privada (masking UI), webhook secret, ambiente (test/prod).
  - Google OAuth / Calendar: clientId/secret.
  - Webhooks: CRUD de endpoints, mostrar últimas 10 entregas (status, response code).

### 4) Gestão de Funcionários e Posições
- CRUD de Employees (nome, email, telefone, cargo(s), horário, comissão, ativo/inativo).
- Posições (Positions): CRUD para cargos com mapeamento de permissões granulares.
- Painel: calendário com horários e breaks, upload de documentos (contrato/ID).
- Regras: ao desativar um funcionário, reatribuir agendamentos/pedidos em aberto.

### 5) Agendamentos (Appointments)
- Entidades: Service, Appointment, EmployeeTimeInterval, Client.
- UI: calendário, criação rápida (wizard), confirmação por e-mail/SMS.
- Regras de disponibilidade:
  - Gerar slots usando `EmployeeTimeInterval` e `Service.duration`.
  - Evitar conflitos (transaction/row lock) — usar transação prisma para criar appointment e marcar slot.
- Notificações: lembretes configuráveis (24h, 1h), cancelamento automático após timeout.
- Edge-cases: horário do cliente em outro timezone; daylight saving adjustments.

### 6) Restaurante: Mesas, Pedidos e Cardápio
- Modelos: Table, Order, OrderItem, Menu, MenuItem, Recipe, RecipeIngredient.
- UI: mapa de mesas (drag/drop), fluxo de pedido em mesa, adicionar itens, dividir conta.
- Pagamento: integrar com Payment (pago, pendente), criar `Transaction` ao fechar mesa.
- Estoque: ao confirmar preparo/fechamento, decrementar `InventoryItem` baseado em `RecipeIngredient`.
- Regras:
  - Mesas reservadas vs ocupadas.
  - Pedidos em andamento permitem adição/remoção com histórico de auditoria.
  - Se estoque insuficiente, marcar item como "indisponível" e notificar gerência.

### 7) Estoque / Inventory
- Entidades: InventoryItem (sku, name, quantity, threshold, unit), InventoryTransaction (type, qty, reason, linkedOrderId).
- UI: lista, ajustes, inventário inicial, movimentações (+ entrada / - saída), relatórios de consumo.
- Regras:
  - Sempre gravar `InventoryTransaction` ao ajustar quantidades.
  - Para receitas, transações em lote (transação db) para manter consistência.
  - Alertas programáveis (quando quantity < threshold).

### 8) Pagamentos e Assinaturas
- Integração Stripe: criar payments, webhooks para confirmação, assinaturas com trials.
- Modelo Payment com status (pending, succeeded, failed, refunded).
- UI: checkout simples, histórico de pagamentos por cliente/empresa.
- Regras:
  - Criar `Payment` antes de redirecionar para Stripe, atualizar via webhook.
  - Tratamento de eventos: payment_intent.succeeded, invoice.payment_failed, charge.refunded.
  - Conciliação manual no financeiro.

### 9) Financeiro & Caixa
- CashRegister: abertura/fechamento, movimentos (cash in/out), final balance.
- Transaction: categoria (sale, refund, expense), natureza (entrada/saída), documentos (NF, recibo).
- Regras:
  - Só Employees/Positions com permissão podem fechar caixa.
  - Ao fechar caixa, gerar relatório e possibilitar ajuste com justificativa.

### 10) Marketing & Notificações
- Campaigns: agendamento de envios (email/SMS/push), segmentação (clientes por tags, lastActive), templates.
- Notification center: fila, retries, logs.
- Regras: opt-out por cliente, GDPR compliance para dados pessoais.

### 11) Relatórios & Auditoria
- Relatórios periódicos: vendas diárias, estoque, comissões, agendamentos atendidos.
- Auditoria: gravação de ações críticas (login, alteração de preço, fechamento de caixa, reembolso).
- UI: filtros por empresa/periodo/employee.

### 12) Integrações & Webhooks
- Webhooks: endpoints configuráveis por empresa com assinatura (HMAC).
- Integração com Google Calendar para sincronizar agendamentos.
- Export CSV/Excel e SFTP para contabilidade.

## Regras de negócio, validações e erros
- Validações de entrada: todos os endpoints fazem validação de schema (Zod/DTOs).
- Erros: responses padronizadas { error: string, code?: string, details?: any }.
- Transações: operações críticas (criar appointment, fechar caixa, decrementar estoque) em transação ACID.
- Permissões: sempre validar token.role + token.companyId server-side. `ADMIN` só age na `companyId` correspondente.
- Rate limit: endpoints públicos com limites mais apertados (login, cadastro) e menores para ações internas.

## Fluxos que podem ainda não estar implementados (recomendações)
- Wizard de migração ao alterar `CompanyType` (mapeamento automático de dados).
- Gestão avançada de usuários externos / multi-company admin.
- Regras complexas de comissionamento por pacote/serviço.
- Simulação de estoque para prever ruptura por demanda prevista.
- Assistente de onboarding (seed automáticos para menus/mesas, serviços, posições).

## Seeds e Migrações sugeridas
- Seeds: CompanyType (RESTAURANTE, ACADEMIA, SALAO, MERCADO), Features iniciais (AGENDAMENTO, RESTAURANTE, INVENTORY, PAYMENTS), Positions padrão (Manager, Cashier, Service), Example admin user.
- Migrations: adicionar tabela Positions vinculada a Employees, índice composto (companyId + email) em User.

## Métricas e observabilidade
- Rastrear: número de requests, latência, taxas de erro 5xx, jobs pendentes, filas de webhook, eventos de pagamento falho.
- Alertas: pagamento falho recorrente, quedas na fila de processamento, logs de segurança (login falho em massa).

---

## Apêndice: Contrato mínimo das APIs (exemplos)
- GET /api/company -> retorna Company + features (autorizado ADMIN/EMPLOYEE)
- PATCH /api/company -> atualiza configurações (somente ADMIN)
- POST /api/appointments -> cria appointment (validação de disponibilidade)
- POST /api/restaurant/orders -> cria order (decrementa estoque ao confirmar)
- POST /api/payments/create -> cria Payment (status pending)
- POST /api/webhooks/stripe -> processa eventos (validar signature)


---

Fim do documento — `DOCS/SYSTEM_REQUIREMENTS.md`.
