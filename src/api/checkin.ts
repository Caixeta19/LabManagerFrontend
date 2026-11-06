import { request } from "./client"

export async function checkIn(codigoQr: string) {
  await request(`/checkin/${encodeURIComponent(codigoQr)}`, { method: "POST" })
}
