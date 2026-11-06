import { request } from "./client"

export type PublicLabStatus = "DISPONIVEL" | "EM_USO_AGORA" | "MANUTENCAO"

export interface PublicSummary {
  laboratoriosAtivos: number
  reservasHoje: number
  equipamentos: number
  usuarios: number
  laboratorios: { nome: string; status: PublicLabStatus }[]
}

export function summary() {
  return request<PublicSummary>("/public/resumo", { auth: false })
}
