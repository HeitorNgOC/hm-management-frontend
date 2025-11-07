# Guia Front-end — HM Management (para iniciar um frontend do zero)

Este documento é um guia prático e detalhado para equipes que vão criar um frontend novo para o sistema HM Management do zero. O backend será tratado como serviço separado — por isso o foco é em arquitetura de frontend, padrões, área de componentes, integração de APIs e como mapear cada funcionalidade do sistema para UI/contratos de API prontos.

Linguagem: PT-BR.

## Visão geral do stack recomendado
- Framework: React 18+ (preferir Vite / Next.js App Router se houver SSR necessário).
- UI primitives e componente system: shadcn/ui (Radix + Tailwind) como fonte de componentes prontos e acessíveis.
- Fetch / Estado remoto: React Query (TanStack Query) para cache de dados, polling, invalidation e atualização otimista.
- Validação e schemas: Zod para validação de request/response e geração de tipos TS.
- Formulários: React Hook Form + @hookform/resolvers/zod.
- Estilização: Tailwind CSS (com tokens de design contidos em um arquivo de tema), preferir classes utilitárias e componentes shadcn.
- Internacionalização: react-intl / i18next (ou outro), iniciar com infraestrutura para PT-BR e EN.
- Testes: Vitest + Testing Library + Playwright (E2E) para fluxos críticos.
- Lint / Formatting: ESLint + Prettier + commitlint (conventional commits).
- Storybook: documentar componentes reutilizáveis.

Observação: o backend é independente — não comentar Prisma. As chamadas de API devem ser configuradas via um cliente (ex.: axios/fetch wrapper) com tipagem gerada a partir dos endpoints (se disponível) e com tratamento de erros padronizado.

## Objetivo do guia
- Definir padrões e convenções para o frontend.
- Mapear componentes e telas por funcionalidade (o que deve ser implementado, props, comportamentos esperados).
- Fornecer contratos e exemplos de chamadas de API (requests/responses) e como integrá-las com React Query e Zod.
- Regras de autenticação e proteção de rotas.

## Contrato mínimo: API client e tipagem
- Criar um módulo `src/lib/api.ts` que exporta:
  - `apiClient` (axios ou fetch wrapper) com interceptors para Authorization, retries e transformação de erros.
  - Helpers `get<T>(url, opts)`, `post<T>(url, data, opts)`, etc., que retornam `Promise<T>` e respeitam um formato de erro padrão.
- Padrão de resposta esperado do backend (exemplo):
  - Sucesso: { data: T }
  - Erro: { error: string, code?: string, details?: any }
- Usar Zod para definir o shape das respostas e validar na camada de fetch (defender contra breaking changes).
- Exportar tipos TypeScript a partir dos schemas Zod para garantir consistência (z.infer<typeof schema>).

## Estrutura de pastas sugerida
- src/
  - app/ (rotas principais — se usar Next.js App Router)
  - pages/ (se Next.js / SPA)
  - components/ (componentes atômicos e compostos)
  - features/ (cada feature grande: appointments, restaurant, inventory, payments)
    - ui/ (componentes específicos da feature)
    - hooks/ (hooks react-query e helpers locais)
    - api.ts (contratos e chamadas locais da feature)
    - types.ts (zod schemas exportados)
  - lib/
    - api.ts (client axios/fetch)
    - auth.ts (helpers auth + token storage)
    - validators/ (schemas zod globais)
  - hooks/ (global hooks: useAuth, useDebounce)
  - styles/ (theme tokens)
  - routes/ (route guards e proteção)
  - utils/ (helpers puramente client-side)
  - i18n/ (resources)
  - tests/

Regras de organização:
- Toda chamada a API deve passar por `features/<name>/api.ts` e por `lib/api.ts`.
- Schemas Zod que validam responses ficarem próximos à API daquela feature (`features/x/types.ts`).
- React Query hooks ficarão em `features/x/hooks/useXyz.ts` e retornarão a shape de dados que os componentes consomem.

## Padrões de desenvolvimento e estilo
- TypeScript estrito: evitar any. Usar zod para validar e inferir tipos.
- Componentes funcionais e hooks; evitar componentes classe.
- Separação clara: UI-only components (sem lógica) em `components/` e containers/pages com hooks e carregamento de dados em `features/`.
- Nome de arquivos: kebab-case para componentes e hooks, ex: `appointment-form.tsx`, `use-appointments.ts`.
- Commits: conventional commits. PRs com descrição do que muda e Screenshots/Storybook links.
- Erros: exibir erro legível para usuário e log técnico para Sentry/observability.

## Autenticação e proteção de rotas
- Fluxo: login -> armazenar access token seguro (httpOnly cookie via backend preferível; se usar localStorage explicar risco). Recomendar cookies httpOnly com refresh token no backend quando possível.
- `lib/auth.ts` fornece `getAuthHeader()` para o `apiClient`.
- Route guard component `components/RouteGuard.tsx` para checar role e positions antes de render.
- React Query: incluir `onError` global para 401 -> redirect para login e `invalidateQueries` apropriadas.

## Uso de React Query (padrões)
- Criar um wrapper `src/lib/queryClient.ts` com configuração central:
  - retry: 1 para requests mutáveis, 0 para login.
  - staleTime: por default 0, custom por feature (ex: inventory: 30s).
  - cacheTime: 5 minutos (ajustável).
  - defaultOptions: useErrorBoundary false, refetchOnWindowFocus false.
- Hooks:
  - Queries com keys previsíveis: ['company', companyId, 'inventory', page]
  - Mutations: usar `onSuccess` para invalidar queries relacionadas e exibir toasts.
  - Prefetching: prefetch em navegação quando possível.
- Otimizações: usar atualizações otimistas quando apropriado e rollback em `onError`.

## Validação com Zod e formulários
- Cada endpoint deve ter um Zod schema correspondente em `features/x/types.ts`.
- Ao receber dados da API, validar com schema.parseAsync antes de usar: protege contra mudanças do backend.
- Forms: React Hook Form + zodResolver(zSchema). Mostrar erros de validação inline.

## shadcn UI — como usar corretamente
- Usar componentes shadcn como blocos construtores: Button, Input, Select, Dialog, Popover, Table, Tabs, Card etc.
- Encapsular padrões visuais em componentes locais quando necessário (ex: <AppTable /> com paginação padrão e ações).
- Acessibilidade: usar as primitives Radix via shadcn que já cuidam de keyboard/aria.
- Tokens de design: criar `src/styles/theme.ts` que mapeia cores do `Company` (branding) e usar CSS variables para permitir theming runtime.
- Não mexer diretamente nos componentes shadcn; compor sobre eles.

## Padrões de UI/UX por funcionalidade (detalhado)
A seguir expandimos cada funcionalidade crítica com: objetivo, descrição detalhada do comportamento, telas sugeridas, componentes, contratos de dados (nomes de schemas/zod), hooks React Query sugeridos, permissões e regras, casos de erro e testes mínimos.

Importante: cada funcionalidade deve fornecer, na pasta `features/<feature>`:
- `types.ts` com Zod schemas para requests/responses;
- `api.ts` com funções HTTP usando `lib/api`;
- `hooks/` com React Query hooks que encapsulam keys e invalidations;
- `ui/` com componentes e pages.

### 1) Configurações da Empresa (Admin)
Objetivo:
- Permitir que um ADMIN configure dados da empresa, branding, segurança e integrações de forma centralizada. Fornecer um único lugar para gerenciar features ativas e integrações (Stripe, webhooks, SMS).

Descrição detalhada:
- Card superior: mostra resumo (nome, CNPJ/ID, CompanyType, plano atual, status, timezone, horário padrão) com ações rápidas (editar, visualizar billing, ir para integrações).
- Tabs:
  - Empresa: conteúdo/contato, endereço, horário de funcionamento, timezone. Validações: formato CNPJ/CEP/telefone.
  - Segurança: MFA toggle (off/optional/required), password policy, sessão expirada, IP whitelist.
  - Branding & Cores: uploader de logo (2MB max), paleta primária/secundária, preview em tempo real.
  - Notificações: configurar provedores (email/SMS), templates e toggles por evento.
  - Features: lista de features com toggles, dependências e tooltips explicativos; enabling pode abrir wizard.
  - Integrações: Stripe keys masked, webhook endpoints CRUD (show last deliveries), Google OAuth.

Componentes principais:
- `CompanyCard`, `SettingsTabs`, `CompanyForm`, `BrandingPreview`, `FeatureToggleList`, `IntegrationList`, `WebhookLogTable`.

Contratos / Zod names (sugestões):
- CompanySchema, CompanyUpdateSchema, FeatureToggleSchema, IntegrationSchema, WebhookDeliverySchema

Hooks / React Query keys (sugestões):
- useCompany(companyId) -> ['company', companyId]
- useUpdateCompany() -> mutation invalidates ['company', companyId]
- useCompanyFeatures(companyId) -> ['company', companyId, 'features']

Permissões:
- Somente ADMIN pode alterar CompanyType, plano, integrações e security toggles. Employees veem mas não editam.

Erros / edge-cases:
- Falha no upload de logo -> mostrar código de erro e opção de retry.
- Ativar feature que depende de outra -> bloquear e instruir a ativar dependência ou rodar wizard.

Testes mínimos:
- Unit: validação Zod para CompanyUpdateSchema.
- E2E: flow de editar branding + salvar e ver preview aplicado.

### 2) Gestão de Usuários e Funcionários
Objetivo:
- Gerenciar usuários ligados à empresa: convites, permissões (role + positions), status (ativo/inativo) e reatribuições em caso de desativação.

Descrição detalhada:
- Lista com filtros (role, position, ativo), busca por nome/email e ações (editar, desativar, reenviar convite).
- Modal/form de criação: campos obrigatórios (nome, email, position(s), telefone, comissionRate opcional).
- Fluxo de convite: gerar token expirável, e-mail com link. Página de aceitação do convite para completar perfil.

Componentes:
- `UserTable`, `EmployeeForm`, `InviteModal`, `PositionSelector`, `UserAvatar`.

Contratos / Zod names:
- UserSchema, CreateUserSchema, InviteSchema, EmployeeSchema

Hooks / keys:
- useUsers(companyId, params) -> ['users', companyId, params]
- useInviteUser() -> invalidates ['users', companyId]

Permissões:
- ADMIN cria/edita. Employees com permissão específica (via position) podem editar perfis limitados (ex: atualizar horário).

Erros / edge-cases:
- E-mail duplicado -> erro 409 com sugestão de mesclar ou usar outro e-mail.
- Convite expirado -> permitir regenerar convite.

Testes mínimos:
- Unit: validação de InviteSchema.
- E2E: convidar usuário, aceitar convite e garantir role/positions aplicados.

### 3) Posições (Positions)
Objetivo:
- Dar granularidade às permissões operacionais através de cargos/positions atribuídos a Employees, permitindo controlar ações (fechar caixa, editar preços, criar serviços).

Descrição detalhada:
- CRUD de positions com nome, descrição e uma matriz de permissões (checkboxes). Permissões devem mapear para flags usadas no frontend (`canCloseCashRegister`, `canManageOrders`, `canEditInventory`).

Componentes:
- `PositionForm`, `PermissionMatrix`, `PositionsTable`.

Contratos / Zod names:
- PositionSchema, PositionCreateSchema, PermissionFlagsSchema

Hooks / keys:
- usePositions(companyId) -> ['positions', companyId]
- useCreatePosition(), useUpdatePosition()

Permissões:
- Apenas ADMIN pode criar/editar positions críticos. Positions padrão (Manager, Cashier, Staff) devem existir no seed.

Erros / edge-cases:
- Remover permission crítica de posição usada por employees -> exigir confirmação e reatribuição automática ou aviso.

Testes mínimos:
- Unit: validação de PermissionFlagsSchema.

### 4) Agendamentos / Appointments
Objetivo:
- Permitir que clientes e funcionários agendem e gerenciem compromissos com regras de disponibilidade, evitando conflitos e oferecendo lembretes/confirmations.

Descrição detalhada:
- Calendar view (month/week/day) com slots gerados a partir de `EmployeeTimeInterval` e `Service.duration`.
- Slot picker: mostrar duração, preço (se aplicável) e funcionários disponíveis. Suportar seleção por funcionário ou auto-assign.
- Criação: validar disponibilidade no backend dentro de transação; criar appointment e opcionalmente payment (pending).
- Cancelamento e reagendamento: respeitar políticas (ex: penalty), enviar notificações.

Componentes:
- `BookingCalendar`, `SlotPickerModal`, `AppointmentCard`, `AppointmentForm`, `RemindersList`.

Contratos / Zod names:
- AvailabilitySchema, AppointmentSchema, CreateAppointmentSchema

Hooks / keys:
- useAvailability(serviceId, date) -> ['availability', serviceId, date]
- useCreateAppointment() -> onSuccess invalidate ['appointments', companyId, date]

Permissões:
- Users podem criar/cancelar seus appointments. Employees com permission podem criar em nome do cliente.

Erros / edge-cases:
- Race conditions (duplo booking) -> backend retorna 409; frontend deve sugerir slots alternativos.
- Timezone/DST issues -> exibir horários na timezone do cliente com conversão clara.

Testes mínimos:
- E2E: booking flow incluindo payment optional, reminder scheduled.

### 5) Restaurante: Mesas e Pedidos
Objetivo:
- Gerenciar operações de salão: mapa de mesas, fluxo de pedidos por mesa, integração com cozinha e consumo de estoque ao confirmar preparo/fechamento.

Descrição detalhada:
- Floor map: posições de mesas visualizadas; abrir/fechar mesa; status (available, reserved, occupied).
- Order screen: adicionar itens, modifiers (ex: sem cebola), notas por item; dividir conta; transferir itens entre mesas.
- Kitchen view: fila de pedidos com status por item (pending, in_progress, ready).
- Fechamento: criar Payment e aguardar confirmação (via webhook) antes de decrementar estoque e fechar order.

Componentes:
- `FloorMap`, `TableCard`, `OrderEditor`, `OrderItem`, `KitchenQueue`, `SplitBillModal`.

Contratos / Zod names:
- TableSchema, OrderSchema, OrderItemSchema, RecipeIngredientSchema

Hooks / keys:
- useTables(companyId) -> ['restaurant', companyId, 'tables']
- useCreateOrder(), useUpdateOrder(), useCloseOrder()

Permissões:
- Garçons (Employees) criam/atualizam orders; apenas positions autorizadas podem fechar e gerar reembolsos.

Erros / edge-cases:
- Item sem estoque -> marcar como unavailable e sugerir substitutos.
- Split bill rounding -> garantir soma consistente e mostrar explicação de arredondamento.

Tempo-real e sync:
- Recomenda-se WebSocket/SSE para kitchen updates e mudanças de mesas; caso não seja possível, usar polling curto.

Testes mínimos:
- E2E: criar order, mover para kitchen, marcar ready, fechar e processar pagamento via webhook stub.

### 6) Inventory / Estoque
Objetivo:
- Controlar entradas/saídas de estoque, histórico de transações e alertas de baixa, garantindo consistência quando consumido por receitas (restaurant) ou vendas.

Descrição detalhada:
- Lista de itens com search, filtros por categoria e low-stock badge.
- Formulário de ajuste (entrada/saída) com motivo obrigatório.
- Relatórios: consumo por período, previsão de ruptura baseada em vendas médias.

Componentes:
- `InventoryTable`, `InventoryItemDetail`, `InventoryAdjustForm`, `LowStockAlert`.

Contratos / Zod names:
- InventoryItemSchema, InventoryTransactionSchema, InventoryReportSchema

Hooks / keys:
- useInventory(companyId, params) -> ['inventory', companyId, params]
- useAdjustInventory() -> onSuccess invalidate ['inventory', companyId]

Permissões:
- Apenas employees com permissões específicas podem ajustar inventário; admins gerenciam thresholds.

Erros / edge-cases:
- Ajuste que resulta em negativo -> bloquear e criar tarefa de reconciliação.
- Processamento em lote falha parcialmente -> transacional rollback e notificação.

Testes mínimos:
- Unit: cálculo de consumo por receita.
- E2E: criar ajuste e confirmar mudança na listagem.

### 7) Pagamentos e Assinaturas
Objetivo:
- Permitir checkout seguro, gerenciar assinaturas e refletir o estado de pagamentos no sistema (pendente, pago, estornado).

Descrição detalhada:
- Checkout: frontend cria pedido/payment via API e redireciona para Stripe Checkout (ou integrações similares). Mostrar estado pending até webhook confirmar.
- Subscriptions: gerenciar plano do cliente, card on file e cancelamento/renewal.

Componentes:
- `Checkout`, `PaymentStatus`, `SubscriptionList`, `BillingPortalLink`.

Contratos / Zod names:
- PaymentCreateSchema, PaymentSchema, SubscriptionSchema

Hooks / keys:
- useCreatePayment() -> returns checkoutUrl
- usePaymentStatus(paymentId) -> ['payment', paymentId]

Permissões:
- Clientes iniciam pagamentos; employees podem criar payments em nome do cliente quando autorizado.

Erros / edge-cases:
- Webhook não entregue -> backend tenta retry; frontend mostra estado `awaiting_webhook` se aplicável.
- Pagamento parcialmente capturado/refunded -> mostrar histórico detalhado.

Testes mínimos:
- E2E com stub de webhook: iniciar checkout, simular webhook e confirmar status.

### 8) Financeiro & Caixa
Objetivo:
- Gerenciar abertura/fechamento de caixa, registrar transações e permitir auditoria/ajustes com justificativa.

Descrição detalhada:
- Abertura: modal com initial balance e responsável.
- Movimentações: registrar cada venda/refund/expense com categoria e documento (opcional).
- Fechamento: resumo com diferenças, justificativas e export CSV.

Componentes:
- `OpenCashModal`, `CashDashboard`, `TransactionRow`, `CloseCashModal`.

Contratos / Zod names:
- CashRegisterSchema, TransactionSchema, CloseCashSchema

Hooks / keys:
- useOpenCash(), useCloseCash(), useTransactions(cashRegisterId)

Permissões:
- Apenas positions com `canCloseCashRegister` podem fechar caixa.

Erros / edge-cases:
- Diferença de contagem -> exigir justificativa e não permitir fechar sem comentário.

Testes mínimos:
- E2E: abrir caixa, registrar vendas, fechar com ajuste e exportar CSV.

### 9) Marketing & Notifications
Objetivo:
- Criar e gerenciar campanhas (email/SMS/push) para segmentação de clientes e acompanhar entregas/metricas.

Descrição detalhada:
- Campaign builder com segment builder (lastActive, tags, spent), templates e scheduling.
- Visualização de logs de envio e taxa de sucesso/abertura (se rastreado).

Componentes:
- `CampaignBuilder`, `SegmentBuilder`, `TemplateEditor`, `CampaignLog`.

Contratos / Zod names:
- CampaignSchema, SegmentSchema, NotificationLogSchema

Hooks / keys:
- useCampaigns(companyId), useCreateCampaign()

Permissões:
- Apenas admins e posições de marketing podem acionar envios massivos.

Erros / edge-cases:
- Problemas com provider (rate limit) -> front mostra retry schedule e erros técnicos.

Testes mínimos:
- Unit: validação de segment builder. E2E: schedule + verify enqueued state.

### 10) Relatórios & Auditoria
Objetivo:
- Oferecer relatórios configuráveis e um audit log detalhado para rastrear ações críticas e permitir compliance.

Descrição detalhada:
- Relatórios: filtros por período, employee, natureza; export CSV/XLSX; preview e agendamento de relatórios.
- Audit log: feed com who/when/what/beforeAfter, filtros por entidade e export.

Componentes:
- `ReportsFilters`, `ReportTable`, `AuditLogTable`, `ReportScheduler`.

Contratos / Zod names:
- ReportRequestSchema, ReportRowSchema, AuditLogEntrySchema

Hooks / keys:
- useReports(params) -> ['reports', params]
- useAuditLogs(params) -> ['audit', params]

Permissões:
- Apenas admins e positions com permissão de auditoria podem acessar logs completos; employees veem transações relacionadas a si.

Erros / edge-cases:
- Relatórios muito pesados -> sugerir geração assíncrona com notificação quando pronto.

Testes mínimos:
- E2E: gerar relatório e baixar CSV; visualizar audit log com filtro.

## Padrões técnicos adicionais
- Feature flags: centralizar em `lib/featureFlags` que consome `/api/company/features` e expõe hook `useFeature('RESTAURANT')`.
- Error handling: padrão global para API errors; criar `ErrorBoundary` para páginas e `useToast` para feedback rápido.
- Loading states: skeletons via shadcn placeholders.
- Accessibility: checar contraste, labels visíveis, keyboard navigation nas tabelas e modals.
- Theming/branding: aplicar CSS variables a partir de `company.branding` que são carregadas no bootstrap do app.

## Requisitos de infra e CI
- CI: rodar lint, typecheck, unit tests e storybook build.
- Deploy: branch main build -> staging -> production pipelines.
- Monitoramento: Sentry + metrics (Prometheus/Grafana) para frontend performance.

## Exemplos práticos (snippets conceituais)
- React Query hook (padrão) — `features/inventory/hooks/useInventory.ts` (conceito):

  - export function useInventory(companyId: string) {
  -   return useQuery(['inventory', companyId], () => api.get(`/api/inventory/items?companyId=${companyId}`).then(res => inventorySchema.parseAsync(res.data)));
  - }

- Mutation padrão com rollback:
  - const createOrder = useMutation(orderData => api.post('/api/restaurant/orders', orderData), {
  -   onMutate: async newOrder => { /* optimistic update */ },
  -   onError: (err, newOrder, context) => { /* rollback */ },
  -   onSettled: () => queryClient.invalidateQueries(['restaurant', companyId])
  - });

- Zod schema layout (features/appointments/types.ts):
  - export const AppointmentSchema = z.object({
  -   id: z.string().uuid(),
  -   serviceId: z.string().uuid(),
  -   employeeId: z.string().uuid().nullable(),
  -   startAt: z.string(),
  -   endAt: z.string(),
  -   status: z.enum(['pending','confirmed','cancelled'])
  - });
  - export type Appointment = z.infer<typeof AppointmentSchema>;

## Checklist para iniciar uma nova feature UI
1. Criar pasta `features/<feature>` com `api.ts`, `types.ts` (Zod), `hooks/` e `ui/`.
2. Implementar Zod schemas para requests e responses.
3. Implementar calls em `api.ts` usando `lib/api`.
4. Criar hooks React Query em `hooks/` e unit tests mínimos.
5. Implementar componentes UI em `ui/` e documentar no Storybook.
6. Garantir traduções i18n e accessibility.
7. Criar PR com descrição, screenshots e link para storybook.

## Observabilidade e qualidade
- Cada feature crítica deve instrumentar eventos (ex: booking.created, payment.succeeded) com traceId.
- Cobertura de testes: unitário para lógica crítica e E2E para fluxo de pagamento/booking.

## Conclusão e próximos passos recomendados
- Gerar um kit mínimo de componentes (Design System) baseado em shadcn e tokens da empresa.
- Implementar `lib/api` e `queryClient` antes de iniciar telas.
- Criar seeds no backend para facilitar desenvolvimento (companies de teste, positions, features ativadas) — frontend assume endpoints conforme listado.

---

Fim do documento — `DOCS/FRONTEND_GUIDE.md`.
