export interface NFSe {
  id: string
  companyId: string
  rps: string
  serviceDescription: string
  clientName: string
  clientCpfCnpj: string
  serviceValue: number
  deductionsValue?: number
  netValue: number
  issueDate: string
  status: NFSeStatus
  xmlUrl?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

export type NFSeStatus = "draft" | "issued" | "cancelled" | "error"

export interface CreateNFSeRequest {
  serviceDescription: string
  clientName: string
  clientCpfCnpj: string
  serviceValue: number
  deductionsValue?: number
}

export interface UpdateNFSeRequest {
  status?: NFSeStatus
  serviceDescription?: string
  clientName?: string
}

export interface NFSeFilters {
  status?: NFSeStatus
  startDate?: string
  endDate?: string
}
