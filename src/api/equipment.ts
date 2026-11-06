import { request } from "./client"
import {
  equipmentToRequest,
  toEquipment,
  type EquipmentDTO,
  type EquipmentInput,
} from "./mappers"

export async function list() {
  const equipment = await request<EquipmentDTO[]>("/equipments")
  return equipment.map(toEquipment)
}

export async function create(input: EquipmentInput) {
  await request("/equipments", {
    method: "POST",
    body: equipmentToRequest(input),
  })
}

export async function update(id: string, input: EquipmentInput) {
  await request(`/equipments/${id}`, {
    method: "PUT",
    body: equipmentToRequest(input),
  })
}
