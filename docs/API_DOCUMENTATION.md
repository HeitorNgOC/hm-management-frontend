# API Documentation - HM Management System

## Índice
1. [Módulo Academia (Gym)](#módulo-academia-gym)
2. [Módulo Ficha de Treino (Workout)](#módulo-ficha-de-treino-workout)
3. [Módulo Guichê de Atendimento (Queue)](#módulo-guichê-de-atendimento-queue)
4. [Módulo Prontuário Médico (Medical Records)](#módulo-prontuário-médico-medical-records)
5. [Módulo Trocas de Produtos (Exchange)](#módulo-trocas-de-produtos-exchange)
6. [Módulo Dashboard](#módulo-dashboard)

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
