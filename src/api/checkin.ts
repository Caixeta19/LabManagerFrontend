import { request } from "./client"

export async function checkIn(codigoQr: string) {
  await request(`/checkin/${encodeURIComponent(codigoQr)}`, { method: "POST" })
}

/** QR fixo do laboratório: o back acha a reserva do usuário logado nesse laboratório. */
export async function checkInLab(token: string) {
  await request(`/checkin/lab/${encodeURIComponent(token)}`, { method: "POST" })
}
