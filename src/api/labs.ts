import { request } from "./client"
import { labToRequest, toLab, type LabDTO, type LabInput } from "./mappers"

export interface OccupiedSlot {
  date: string
  startTime: string
  endTime: string
}

interface OccupiedSlotDTO {
  dataHoraInicio: string
  dataHoraFim: string
}

/** Laboratórios ativos, inclusive os em manutenção. */
export async function list() {
  const labs = await request<LabDTO[]>("/laboratories")
  return labs.map(toLab)
}

/** Todos os laboratórios, inclusive os inativos (ADMIN). */
export async function listAll() {
  const labs = await request<LabDTO[]>("/laboratories/todos")
  return labs.map(toLab)
}

export async function occupiedSlots(labId: string): Promise<OccupiedSlot[]> {
  const slots = await request<OccupiedSlotDTO[]>(
    `/laboratories/${labId}/ocupacao`,
  )
  return slots.map((slot) => ({
    date: slot.dataHoraInicio.slice(0, 10),
    startTime: slot.dataHoraInicio.slice(11, 16),
    endTime: slot.dataHoraFim.slice(11, 16),
  }))
}

export async function create(input: LabInput) {
  await request("/laboratories", { method: "POST", body: labToRequest(input) })
}

export async function update(id: string, input: LabInput) {
  await request(`/laboratories/${id}`, {
    method: "PUT",
    body: labToRequest(input),
  })
}
