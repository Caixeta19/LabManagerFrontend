import { request } from "./client"
import { toLoan, type LoanDTO, type NewLoanInput } from "./mappers"

/** Todos os empréstimos (ADMIN). */
export async function list() {
  const loans = await request<LoanDTO[]>("/loans")
  return loans.map(toLoan)
}

export async function mine() {
  const loans = await request<LoanDTO[]>("/loans/me")
  return loans.map(toLoan)
}

export async function create(input: NewLoanInput) {
  await request("/loans", {
    method: "POST",
    body: {
      equipmentId: input.equipmentId,
      dataDevolucaoPrevista: input.expectedReturn,
    },
  })
}

export async function returnEquipment(id: string) {
  await request(`/loans/${id}/devolver`, { method: "PUT" })
}
