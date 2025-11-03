import { z } from "zod"

export const prescriptionSchema = z.object({
  id: z.string().optional(),
  medication: z.string().min(1, "Nome do medicamento é obrigatório"),
  dosage: z.string().min(1, "Dosagem é obrigatória"),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  duration: z.string().min(1, "Duração é obrigatória"),
  instructions: z.string().optional(),
})

export const examSchema = z.object({
  id: z.string().optional(),
  examType: z.string().min(1, "Tipo de exame é obrigatório"),
  requestDate: z.string().min(1, "Data de solicitação é obrigatória"),
  resultDate: z.string().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
})

export const vaccineSchema = z.object({
  id: z.string().optional(),
  vaccineName: z.string().min(1, "Nome da vacina é obrigatório"),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  applicationDate: z.string().min(1, "Data de aplicação é obrigatória"),
  nextDoseDate: z.string().optional(),
  veterinarianId: z.string().optional(),
  notes: z.string().optional(),
})

export const procedureSchema = z.object({
  id: z.string().optional(),
  procedureName: z.string().min(1, "Nome do procedimento é obrigatório"),
  description: z.string().optional(),
  duration: z.number().min(0).optional(),
  anesthesia: z.boolean().optional(),
  complications: z.string().optional(),
  notes: z.string().optional(),
})

export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  recordType: z.enum(["consultation", "exam", "surgery", "vaccination", "emergency", "follow_up"]),
  date: z.string().min(1, "Data é obrigatória"),
  veterinarianId: z.string().optional(),
  chiefComplaint: z.string().optional(),
  anamnesis: z.string().optional(),
  physicalExam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescriptions: z.array(prescriptionSchema).optional(),
  exams: z.array(examSchema).optional(),
  vaccines: z.array(vaccineSchema).optional(),
  procedures: z.array(procedureSchema).optional(),
  notes: z.string().optional(),
  nextAppointment: z.string().optional(),
})

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial()

export const createPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  species: z.string().optional(),
  breed: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),
  weight: z.number().min(0).optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  ownerId: z.string().min(1, "Selecione um tutor"),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  bloodType: z.string().optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export type CreateMedicalRecordFormData = z.infer<typeof createMedicalRecordSchema>
export type UpdateMedicalRecordFormData = z.infer<typeof updateMedicalRecordSchema>
export type CreatePatientFormData = z.infer<typeof createPatientSchema>
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>
