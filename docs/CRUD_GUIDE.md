# Padrão de CRUDs — HM Management (guia objetivo)

Este documento descreve, de forma prática e independente, o padrão que deve ser seguido ao implementar qualquer CRUD (Create / Read / Update / Delete) no frontend do sistema. O foco é UX e comportamento esperado: quais telas/composições oferecer para cada recurso, como tratar paginação, filtros, ordenação, bulk actions e boas práticas para erros e testes. Não contém implementação de componentes/JSX — apenas orientações de alto nível e contrato de UX.

Sumário
- Objetivo e escopo
- Estrutura mínima de UI para um CRUD
- Padrões de listagem
- Criação (modal vs página/aba)
- Edição
- Exclusão (apagar)
- Paginação, filtros e ordenação
- Bulk actions e seleção em massa
- Validação, erros e feedback ao usuário
- Regras de cache e invalidation (React Query)
- Considerações de acessibilidade
- Testes mínimos recomendados
- Exemplo conciso de checklist por recurso

## Objetivo e escopo
- Fornecer um padrão único e consistente para todas as telas CRUD do frontend.
- Garantir que equipes diferentes implementem UX previsível: mesma estrutura, comportamento e tratamento de erros.
- Aplicável a todos os recursos listados no sistema (Company, Users, Employees, Services, Appointments, Menus, Orders, Inventory, Payments, etc.).

## Estrutura mínima de UI para um CRUD
Para cada recurso, o frontend deve ter pelo menos:
- Página de listagem (List view) — mostra os itens com busca, filtros, ordenação e paginação.
- Ação de Criar — componente de criação: modal simples ou página/aba (quando o formulário for grande ou com múltiplas tabs).
- Ação de Editar — modal de edição (ou página dedicada para forms complexos).
- Ação de Apagar — confirmação modal de exclusão (com justificativa quando necessário).
- Feedback visual: toasts/alerts para sucesso/erro, skeletons para loading e placeholders para empty state.

Observação: o padrão incentiva **modals** para operações rápidas (criar/editar) e **páginas/abas** para workflows longos (ex.: criação de menu complexo, onboarding de empresa, configurações de integração).

## Padrões de listagem
A listagem (List view) deve incluir:
- Cabeçalho com título, botão de "Criar" e ações globais (Export, Import, Bulk actions).
- Barra de busca (search) que faz debounce (300-500ms) e pode buscar por campos chave (nome, email, sku).
- Filtros avançados (collapsible panel) com campos relevantes por recurso (data, status, category, employee).
- Colunas configuráveis (mostrar/ocultar colunas) quando aplicável.
- Estado de carregamento: skeleton rows.
- Empty state com CTA primário (ex.: "Criar primeiro item").
- Paginação clara com número total e controles de página e tamanho da página.
- Ações por linha: View, Edit, Delete, (contextual) more actions.

UX tip: ao aplicar filtros ou mudar paginação, manter os parâmetros na query string para permitir deep-links e refresh seguro.

## Criação (Create)
Recomendações gerais:
- Modal de Criar: preferir quando o formulário tem < 10 campos ou é uma criação rápida.
- Página / Aba de Criar: usar quando o fluxo exige vários passos, tabs, upload de arquivos pesados ou configuração avançada.
- Validação: validação inline com resumo de erros no topo do modal/página; bloquear envio até corrigidos.
- UX de sucesso: fechar modal automaticamente e mostrar toast de sucesso; opcionalmente navegar para a página do item criado.
- Preenchimento parcial: quando aplicável, permitir salvar rascunho.

Campos e prioridades:
- Destacar obrigatoriedade com marcação clara.
- Regras de negócio (ex.: unicidade de email) devem ser validadas no frontend e confirmadas pelo backend; erros de unicidade devem mapear para mensagens amigáveis.

## Edição (Update)
- Modal de edição: padrão para alterações rápidas (detalhes, status, pequenas correções).
- Página de edição: usar para formulários grandes, ou quando histórico/versões precisam aparecer junto ao form.
- Ao salvar: otimista update é aceitável para UX responsiva, desde que haja rollback em caso de erro.
- Mostrar mudanças pendentes: ao editar campos sensíveis (preço, commission), exibir confirmação com before/after no modal.

## Exclusão (Delete)
- Sempre confirmação explícita (modal) com copy clara do que será apagado.
- Para entidades críticas (orders, payments, transactions), exigir justificativa e/ou soft-delete (mark as deleted) com opção de restauração.
- Mostrar warnings se outras entidades dependem do item (ex.: apagar um produto usado em recipes) e oferecer ações alternativas.

## Paginação, filtros e ordenação
- Default: usar paginação no backend para listas maiores (cursor-based ou offset-based dependendo do endpoint). Frontend deve suportar ambos, mas priorizar cursor-based para performance quando possível.
- Página de tamanho: permitir 10/25/50/100, salvar preferência localmente (localStorage).
- Ordenação: colunas com ordenação asc/desc, manter estado em query string.
- Filtros combináveis: permitir AND/OR conforme necessidade do recurso; exibir chips das regras ativas acima da listagem.

## Bulk actions (seleção em massa)
- Permitir seleção multi-linha com checkbox no header para "selecionar tudo na página" e opção para "selecionar tudo nos resultados" quando necessário.
- Ações típicas: delete em massa, exportar, aplicar tag/status.
- Bulk actions devem mostrar um resumo antes de executar (ex.: "Você vai apagar 432 itens — confirmar?").
- Processamento: para operações longas, executar em background (job) e notificar quando concluído; mostrar progress onde aplicável.

## Validação, erros e feedback ao usuário
- Padronizar formato de erros do backend e mapear para mensagens amigáveis.
- Erros esperados:
  - 400: validação -> mostrar erros por campo
  - 401: não autorizado -> redirect para login
  - 403: forbidden -> exibir página/alerta de permissão
  - 409: conflito (ex.: duplicidade) -> mostrar instrução para resolução
  - 500: server error -> fallback com botão de retry
- Exibir toasts para ações bem-sucedidas e modals para erros críticos.
- Fornecer link direto para suporte quando erro crítico for detectado (com traceId/correlationId).

## Regras de cache e invalidation (React Query)
- Queries: cada listagem tem key previsível, ex: ['<resource>', params].
- Mutations: após create/update/delete invalidar as queries relevantes:
  - Create -> invalidate list queries (['resource', params])
  - Update -> invalidate item cache and list queries
  - Delete -> invalidate list queries and optionally remove item from cache
- Otimistic updates: usar para melhorar UX, mas garantir rollback com onError.
- Refetch policies: após mutation, refetch para garantir consistência eventual quando aplicável.

## Considerações de acessibilidade
- Todos os modals devem ser acessíveis: foco inicial, trap focus, close on Escape, aria-labelledby/aria-describedby.
- Tabelas: usar semantic table markup, row headers where applicable, e role attributes.
- Form controls: labels visíveis, hint text e mensagens de erro claras.
- Keyboard navigation: permitir navegação por teclado em listas e modals.

## Testes mínimos recomendados
Para cada recurso CRUD, ter ao menos:
- Unit tests:
  - Validação de schemas (Zod) — inputs válidos e inválidos.
  - Hooks de fetch/mutation com mocks (testar invalidation e comportamento em erro).
- Integration/E2E:
  - Listagem: obter lista, aplicar filtro, paginar.
  - Create flow: abrir modal/página, preencher, submeter, verificar item na listagem.
  - Edit flow: editar um campo crítico e verificar atualização.
  - Delete flow: apagar e assegurar remoção; testar soft-delete se aplicável.
- Tests de acessibilidade básicos (axe) nas páginas críticas.

## Exemplo conciso de checklist para implementar um CRUD
1. Criar rota/página de listagem com query params para filtros/pagination.
2. Implementar chamada de listagem e schema Zod para response.
3. Implementar Create (modal ou página) com validação zod e mutation.
4. Implementar Edit (modal/página) com mutation e invalidation correta.
5. Implementar Delete com confirmação modal e tratamento de dependências.
6. Suportar paginação, sorting e filtros e salvar estado em query string.
7. Registrar testes unitários e E2E básicos.
8. Garantir acessibilidade e mensagens de erro amigáveis.

---

## Matriz detalhada de todos os CRUDs e nuances da aplicação
Nesta seção descrevemos, recurso a recurso, as nuances importantes para implementar cada CRUD corretamente — validações, relações, regras transacionais, comportamentos esperados ao frontend e pontos de atenção (concorrência, mensagens de erro, testes). Para cada recurso mostramos: campos críticos, validações, dependências, comportamento de exclusão, sugestões de paginação e notas de UI/UX relevantes.

Observação: adaptar nomes de campos conforme o backend real. Aqui usamos nomes descritivos e regras de negócio derivadas do design do sistema.

1) Company
- Campos críticos: id, name, companyType, cnpj, address, timezone, branding, plan, status, features[]
- Validações: CNPJ único, timezone válido, logo <= 2MB, plan corresponde a um plano conhecido.
- Dependências: Company -> many Features, Positions, Users, Employees, InventoryItems, Menus.
- Exclusão: soft-delete recomendado; ao remover, bloquear criação de novos recursos e avisar admins.
- Transações: ao alterar CompanyType, botão de "migrate" que executa steps em transação (seed menus/services) ou cria tasks para migração assíncrona.
- Paginação: não aplicável (single), mas endpoints relacionados devem filtrar por companyId.
- UI notes: ativar/desativar features pode disparar wizards.

2) User (cliente/plataforma)
- Campos: id, email, name, role (ADMIN|EMPLOYEE|USER), companyId?, positions?, phone, profileCompleted
- Validações: e-mail unique per system or per company (decidir); password rules via backend.
- Exclusão: soft-delete para audit; se hard-delete, remover tokens e limpar referências.
- Nuances: convite por e-mail com token expirável; aceitar convite completa profile.
- Segurança: quando trocar email, checar verificação e reautenticação.

3) Employee
- Campos: id, userId, companyId, positions[], workingHours, commissionRate, active
- Validações: positions válidas, horários coerentes (no-overlap), commissionRate 0-100
- Dependências: appointments, orders, transactions (commissions)
- Exclusão: desativar por padrão; reatribuir appointments/pedidos abertos a outro employee.
- Concorrência: mudança de horário enquanto há bookings futuros -> revalidação de slots.

4) Position
- Campos: id, companyId, name, description, permissions (flags)
- Nuances: permissions devem mapear para checks frontend e backend (duplique checagem server-side)
- Exclusão: se position em uso por employees, exigir reatribuição antes.

5) Feature / CompanyFeature
- Campos: code, name, description, dependencies
- Nuances: ativar pode exigir seed; desativar pode ocultar rotas no frontend mas não apagar dados.

6) Service
- Campos: id, companyId, name, duration, price, requiresEmployee, capacity
- Validações: duration > 0, price >= 0
- Nuances: serviços com capacity >1 permitem multiple bookings same slot.

7) EmployeeTimeInterval / WorkingHours
- Campos: id, employeeId, dayOfWeek, startTime, endTime, breaks[]
- Validações: não-overlap, mínimo slot, break inside interval
- Nuances: daylight saving handling; armazenar timezone-aware ISO strings

8) Appointment
- Campos: id, companyId, serviceId, employeeId?, clientId, startAt, endAt, status
- Validações: startAt < endAt; availability check server-side em transação
- Nuances:
  - Race: criar appointment deve checar disponibilidade em tx e usar row-locks ou verificação idempotente; retornar 409 se conflito
  - Timezone: exibir horário no timezone do cliente
  - Cancel policy: aplicar penalties/fees automaticamente se configured
  - Notifications: schedule reminders (background job)

9) Table (restaurante)
- Campos: id, companyId, name/number, seats, location(x/y optional), status
- Nuances: move/merge tables (transfer orders), reservations vs walk-in

10) Menu / MenuItem
- Campos: menu id, title, items[]; item: id, name, price, category, available
- Nuances: versioning for menu changes (audit), item availability tied to inventory

11) Recipe / RecipeIngredient
- Campos: recipeId, name, ingredients[{inventoryItemId, qty}], yield
- Nuances: when order confirms, decrement inventory by qty * servings; use transaction; if insufficient stock, block or mark item unavailable

12) Order / OrderItem
- Campos: id, tableId?, clientId?, items[{menuItemId, qty, modifiers}], status, total
- Validações: total computed server-side, prices authoritative on server
- Nuances:
  - Partial payments and split bills: support multiple Payment records per order
  - Reopen/void: audit entries mandatory
  - Kitchen workflow: per-item statuses; use pub/sub for real-time updates

13) InventoryItem
- Campos: id, sku, name, quantity (decimal), unit, threshold
- Nuances:
  - Unit conversions (kg to g) should be normalized
  - Negative quantities blocked or flagged for reconciliation
  - Inventory adjustments always create InventoryTransaction

14) InventoryTransaction
- Campos: id, itemId, type(in/out/adjustment), qty, reason, sourceId (orderId/recipe)
- Nuances: batch transactions for recipes; rollback entire batch on failure

15) Payment
- Campos: id, amount, currency, status (pending/succeeded/failed/refunded), externalId
- Nuances:
  - Create Payment before redirecting to gateway; mark pending
  - Process webhook events idempotently (store event id)
  - Refunds: support partial refunds and link to original payment
  - Retry policy: failed immediate payments may be retried or retried by webhook

16) Subscription
- Campos: id, clientId, planId, status, trialEndsAt, nextBillingAt
- Nuances: auto-renew, coupon/discounts, proration on plan change

17) CashRegister
- Campos: id, companyId, openedBy, openedAt, initialBalance, finalBalance, closedAt
- Nuances:
  - Only authorized positions can open/close
  - Close process should snapshot transactions and prevent new transactions for that register

18) Transaction (financeiro)
- Campos: id, cashRegisterId?, paymentId?, type (sale/refund/expense), amount, nature
- Nuances: link to invoices, NFC-e, tax documents; require attachments for expenses

19) Commission
- Campos: id, employeeId, orderId, percentage, amount, status
- Nuances: calculate on order closure; support manual adjustments and approval workflows

20) MarketingCampaign / Notification
- Campos: id, name, segment, template, scheduledAt, status
- Nuances: opt-out respect, provider rate-limits, retry/backoff for failed deliveries

21) AuditLog
- Campos: id, actorId, action, entity, entityId, before, after, createdAt
- Nuances: immutable records, retention policy, exportable

22) Webhook (management)
- Campos: id, companyId, url, secret, active
- Nuances: store delivery attempts, expose redeliveries, mask secrets in UI

23) Extras / cross-cutting nuances
- Soft-delete vs hard-delete: prefer soft-delete with admin-only purge for critical entities.
- Idempotency: mutations that can be retried (create payment, create order) must accept idempotency keys.
- Background jobs: long-running tasks (report generation, inventory reconciliation, large imports) must be queued and provide status endpoint.
- Audit & tracing: include correlationId in requests; surface traceId in error pages for support.
- Rate limiting: protect public endpoints (login, invite) and heavy actions (marketing send).

## Observability de erros e mensagens para o frontend
- Mapear códigos HTTP para mensagens UX-friendly (veja seção anterior). Para erros técnicos enviar traceId para suporte.
- Para operações transacionais, se rollback ocorrer, retornar estado consistente e instrução de retry.

## Testes e QA específicos por recurso
- Além dos testes mínimos listados, recomenda-se:
  - Payments: testar webhooks idempotency e partial refunds
  - Inventory & Recipes: testes de integração que simulam criação de order e consumo de estoque
  - CashRegister: simular múltiplas vendas e fechar caixa com ajustes

---

Fim do documento — `DOCS/CRUD_GUIDE.md`.
