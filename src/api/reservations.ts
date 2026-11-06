import { request, requestBlob } from "./client"
import {
  toReservation,
  type NewReservationInput,
  type ReserveDTO,
} from "./mappers"

/** Todas as reservas (ADMIN e PROFESSOR). */
export async function list() {
  const reservations = await request<ReserveDTO[]>("/reserves")
  return reservations.map(toReservation)
}

export async function mine() {
  const reservations = await request<ReserveDTO[]>("/reserves/me")
  return reservations.map(toReservation)
}

/** O back recebe horário de Brasília sem fuso: a data não passa por `Date` para não virar UTC. */
export async function create(input: NewReservationInput) {
  await request("/reserves", {
    method: "POST",
    body: {
      laboratoryId: input.labId,
      dataHoraInicio: `${input.date}T${input.startTime}:00`,
      dataHoraFim: `${input.date}T${input.endTime}:00`,
      reason: input.reason,
    },
  })
}

export async function cancel(id: string) {
  await request(`/reserves/${id}/cancelar`, { method: "PUT" })
}

export function qrCode(id: string) {
  return requestBlob(`/reserves/${id}/qrcode`)
}
