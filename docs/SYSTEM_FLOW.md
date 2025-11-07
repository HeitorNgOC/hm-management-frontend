# Fluxo do Sistema — HM Management

Este documento descreve fluxos end-to-end, passo-a-passo, cobrindo cenários principais e alternativos. Inclui detalhes de UI, chamadas API, validações, transações, e pontos de observabilidade.

Sumário
- Visão geral dos fluxos
- Onboarding (empresa e admin)
- Onboarding de funcionário (employee)
- Configuração inicial (wizard para CompanyType)
- Fluxo de autenticação (login, recuperação, sessões)
- Fluxo: Criação e gestão de posições (cargos)
- Fluxo: Agendamento (cliente) — passo-a-passo
- Fluxo: Restaurante — mesas e pedidos
- Fluxo: Pagamento e webhook Stripe
- Fluxo: Abertura/Fechamento de caixa
- Fluxo: Ajuste de estoque e consumo por receita
- Fluxo: Campanhas de Marketing e notificações
- Fluxo: Auditoria e relatório de erros
- Fluxos alternativos e tratamento de falhas

## Visão geral dos fluxos
Cada fluxo apresenta:
- Ator primário (ADMIN / EMPLOYEE / USER)
- UI/rota principal
- Sequência de passos cliente -> servidor
- Regras de autorização e transações
- Ponto de persistência e eventos emitidos
- Possíveis falhas e correções recomendadas

## 1) Onboarding — criar empresa + admin (fluxo inicial)
Ator: Super-usuário que cria a empresa (signup/portal de vendas) ou ADMIN convidado por outro ADMIN.

Passos:
1. Formulário de criação de Company: companyName, CompanyType, CNPJ/ID, timezone, plano.
2. Backend cria `Company` e grava CompanyFeature conforme plano/defaults.
3. Seed mínimo (transacional): criar Positions padrão, criar exemplo de Feature, criar admin user (ou enviar convite por e-mail).
4. Enviar e-mail de confirmação para o `ADMIN` com link de ativação (token expirável 24h).
5. Primeiro login do ADMIN: forçar setup wizard (logo, cores, horário, integrar Stripe se necessário).

Eventos e Side-effects:
- Emissão de evento `company.created` para fila (notificar analytics/provisionamento).
- Se `CompanyType=RESTAURANTE`, criar wizard para mesas/menu automatizado.

Falhas possíveis:
- Duplicidade de CNPJ -> sugerir merge ou erro com instrução.
- Falha ao criar seeds -> rollback e notificação.

## 2) Onboarding de Employee
Ator: ADMIN

Passos:
1. ADMIN vai em `Configuração > Equipe > Novo funcionário`.
2. Inserir nome, email, telefone, posição(s), horário, comissão.
3. Backend cria `User` com role `EMPLOYEE` e link para `Employee` record; gera convite por e-mail com token.
4. Funcionário recebe convite, completa cadastro (senha, M-Factor se requerido) e configura perfil.

Regras:
- Ao criar, validar e impedir e-mails duplicados na mesma company.
- Se posição exige autorização extra (ex: `canCloseCashRegister`), somente admins podem atribuir.

Falhas:
- E-mail não entregue -> reenvio de convite, log de falha de envio.

## 3) Configuração inicial (wizard por CompanyType)
Ator: ADMIN

Passos:
1. Após primeiro login, mostrar wizard baseado em `CompanyType`.
2. Exemplos:
   - RESTAURANTE: criar 1-5 mesas, adicionar menu inicial com 10 itens, criar 1 receita vinculada a menu item.
   - ACADEMIA: criar serviços/classes, horários, planos de assinatura.
   - SALÃO: criar serviços, funcionários e disponibilidades.
3. Salvar em transação e marcar `profileCompleted`.

Observabilidade:
- Marcar eventos `onboarding.completed` com métricas de tempo até conclusão.

## 4) Fluxo de autenticação
Ator: todos

Passos:
- Login: POST /api/auth/callback (NextAuth) -> retorna JWT com claims.
- Rotas server-side usam `getToken` para extrair claims.
- Proteção de rota: middleware checa token e `companyId` quando necessário.

Sessões:
- Sessões curtas (ex: 1h), refresh via re-login ou refresh token (se implementado).
- MFA: se habilitado, login exige TOTP/OTP antes de emitir token final.

Falhas:
- Token inválido/expirado -> 401, forçar re-login.
- Tentativas de força bruta -> rate-limit e CAPTCHA.

## 5) Fluxo: Criação e gestão de Positions (cargos)
Ator: ADMIN

Passos:
1. ADMIN cria Position (nome, descr, permissions array).
2. Backend persiste `Position` ligado à company.
3. Ao editar funcionário, ADMIN associa position(s) ao Employee.

Regras:
- Positions são específicas da empresa (scoped by companyId).
- Permissões aplicadas dinamicamente no frontend (FeatureGuard + Permission check API).

## 6) Fluxo: Agendamento (cliente) — passo-a-passo
Ator: USER (cliente) ou EMPLOYEE (agendamento interno)

Cenário principal (cliente agenda via website ou app):
1. Cliente seleciona serviço -> seleciona data/horário.
2. Frontend consulta disponibilidade: GET /api/availability?serviceId&date&companyId
   - Backend calcula slots usando `EmployeeTimeInterval` + `Service.duration` + já ocupados.
3. Cliente escolhe slot e confirma reserva com dados básicos (nome, phone, payment optional).
4. POST /api/appointments -> criar Appointment em transação:
   - Verifica conflito (re-check availability inside tx), bloqueia slot por short TTL.
   - Persistir Appointment e, se payment required, criar Payment (pending).
5. Enviar notificações (email + SMS) e reminder scheduled job.

Cancelamento e Reagendamento:
- Regras de cancelamento por policy (ex: free until 24h), possível cobrança de penalty.
- Reagendamento: validar nova disponibilidade.

Falhas:
- Race condition: dois clientes reservam o mesmo slot -> a transação que falhar deve retornar 409 com sugestão de slots alternativos.

## 7) Fluxo: Restaurante — mesas e pedidos
Ator: EMPLOYEE (garçom), ADMIN (gerente), USER (pedido via app)

Cenário: criar e fechar pedido de mesa
1. Abrir mesa: EMPLOYEE clica em mesa no mapa -> cria Order com status `open`.
2. Adicionar itens: add item -> cria OrderItem (quantity, options).
   - Se item tem Recipe, verificar estoque: se insuficiente, marcar `item.unavailable` e notificar.
3. Cozinha confirma preparo (opcional): orderItem.status -> `in_progress` -> `ready`.
4. Ao solicitar conta, EMPLOYEE fecha order -> Payment é criado (pending) e redireciona para checkout.
5. Pagamento confirmado via webhook -> Order.status = `paid`, gerar Transaction e decrementar estoque baseado em `RecipeIngredient`.
6. Se pagamento falhar -> Order mantém status `awaiting_payment` e notifica gerência.

Edge-cases:
- Dividir conta: criar multiple Payments vinculados ao mesmo Order.
- Reabrir mesa: somente se Order.status permite; criar audit log para cada reabertura.

## 8) Fluxo: Pagamento e Webhook Stripe
Ator: USER / EMPLOYEE / System

Passos (checkout simples):
1. Backend cria `Payment` { amount, currency, companyId, status: pending, externalId: null }.
2. Backend cria sessão Stripe (Checkout Session) e retorna URL ao frontend.
3. Cliente paga e Stripe envia webhook `checkout.session.completed`.
4. Webhook endpoint valida assinatura e atualiza `Payment` (set externalId, status: succeeded).
5. Emitir evento interno `payment.succeeded` para conciliador financeiro.

Falhas e correções:
- Webhook não autenticado -> descartar e responder 401.
- Retries: usar idempotency keys; gravar lastEventId processado para evitar duplo processamento.

## 9) Fluxo: Abertura / Fechamento de Caixa
Ator: EMPLOYEE com permissão (via Position)

Abertura:
1. Employee inicia `CashRegister` com initialBalance.
2. Sistema registra abertura no audit log.

Movimentações:
- Cada venda/pagamento cria Transaction vinculado ao CashRegister corrente.

Fechamento:
1. Employee fecha caixa -> frontend pede confirmação e justificativa para ajustes.
2. Backend calcula finalBalance = initial + sum(in) - sum(out) + ajustes.
3. Gerar relatório e bloquear novas transações para aquele caixa (fechado).

Regras:
- Somente positions autorizadas podem fechar caixa.
- Ao fechar, criar snapshot (transactions list) e arquivo exportável.

## 10) Fluxo: Ajuste de estoque e consumo por receita
Ator: EMPLOYEE / System

Passos:
1. Pedido confirmado -> para cada `RecipeIngredient` do item, criar InventoryTransaction (type: consumption, qty: n * servings).
2. Executar dentro de transação, rollback se qualquer operação falhar.
3. Se quantidade resultante < 0 -> lançar alerta e criar tarefa para reposição.

Ajustes manuais:
- Usuário pode ajustar (positivo/negativo) com motivo obrigatória (variação, perda, compra).

## 11) Fluxo: Campanhas de Marketing
Ator: ADMIN / Marketing

Passos:
1. Criar campanha com segmentação e template.
2. Agendar envio; sistema enfileira notificações com throttling por provider.
3. Executar envio; registrar entregas e falhas; retries configuráveis.

Regras:
- Respeitar opt-out do cliente.
- Registrar métricas de abertura e conversão (link tracking).

## 12) Fluxo: Auditoria e Relatório de Erros
Ator: System / Admin

Passos:
- Erros críticos geram ticket/log com stack trace (mas sem dados sensíveis).
- Ações sensíveis (alterar preço, fechar caixa, reembolso) geram entradas na tabela `AuditLog` (who, when, what, before/after).

## Fluxos alternativos e tratamento de falhas
- Race conditions: usar locks DB ou verificações em transação; retornar 409 com informação.
- Falha em webhook Stripe: armazenar payload e schedule retry com backoff.
- Falha no envio de e-mail: enfileirar para retry e criar fallback manual para admins.
- Divergência de saldo em caixa: permitir ajuste manual com justificativa e registrar auditoria.

## Observabilidade e pontos de instrumentation
- Instrumentar: criação de appointment, criação/fechamento de caixa, pagamentos (status changes), desalocação de estoque.
- Logs estruturados com traceId para operações cross-service.
- Dashboard com KPIs: bookings/day, revenue/day, average ticket, low-stock items.

## Resumo de contratos e endpoints críticos (exemplos)
- POST /api/companies -> cria company + seeds (onboarding)
- POST /api/auth/invite -> convida usuário (admin)
- GET /api/availability -> retorna slots calculados
- POST /api/appointments -> cria appointment (validação+tx)
- POST /api/restaurant/orders -> cria/atualiza order
- POST /api/payments/create -> cria registro de Payment
- POST /api/webhooks/stripe -> processa stripe events

---

Fim do documento — `DOCS/SYSTEM_FLOW.md`.
