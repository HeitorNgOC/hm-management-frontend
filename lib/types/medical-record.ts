// Medical Records module types for clinics and pet shops

export interface MedicalRecord {
  id: string
  companyId: string
  patientId: string
  patient?: Patient
  recordType: RecordType
  recordNumber: string
  date: string
  veterinarianId?: string
  veterinarian?: {
    id: string
    name: string
  }
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
  attachments?: string[]
  nextAppointment?: string
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export type RecordType = "consultation" | "exam" | "surgery" | "vaccination" | "emergency" | "follow_up"
export type RecordStatus = "draft" | "completed" | "cancelled"

export interface Patient {
  id: string
  companyId: string
  name: string
  species?: string // For pets: dog, cat, bird, etc.
  breed?: string
  gender?: "male" | "female"
  birthDate?: string
  weight?: number
  color?: string
  microchip?: string
  ownerId: string
  owner?: {
    id: string
    name: string
    phone: string
    email?: string
  }
  allergies?: string[]
  chronicConditions?: string[]
  bloodType?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Exam {
  id: string
  examType: string
  requestDate: string
  resultDate?: string
  result?: string
  attachments?: string[]
  notes?: string
}

export interface Vaccine {
  id: string
  vaccineName: string
  manufacturer?: string
  batchNumber?: string
  applicationDate: string
  nextDoseDate?: string
  veterinarianId?: string
  notes?: string
}

export interface Procedure {
  id: string
  procedureName: string
  description?: string
  duration?: number
  anesthesia?: boolean
  complications?: string
  notes?: string
}

export interface CreateMedicalRecordRequest {
  patientId: string
  recordType: RecordType
  date: string
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
}

export interface UpdateMedicalRecordRequest {
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
  status?: RecordStatus
}

export interface CreatePatientRequest {
  name: string
  species?: string
  breed?: string
  gender?: "male" | "female"
  birthDate?: string
  weight?: number
  color?: string
  microchip?: string
  ownerId: string
  allergies?: string[]
  chronicConditions?: string[]
  bloodType?: string
}

export interface UpdatePatientRequest {
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

export interface MedicalRecordFilters {
  search?: string
  patientId?: string
  recordType?: RecordType
  status?: RecordStatus
  startDate?: string
  endDate?: string
}

export interface PatientFilters {
  search?: string
  species?: string
  ownerId?: string
  isActive?: boolean
}

export interface PatientHistory {
  patient: Patient
  totalRecords: number
  lastVisit?: string
  upcomingVaccines: Vaccine[]
  activeConditions: string[]
  recentRecords: MedicalRecord[]
}
