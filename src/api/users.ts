import { request } from "./client"
import {
  roleToApi,
  toUser,
  type NewUserInput,
  type UserDTO,
  type UserUpdateInput,
} from "./mappers"

export async function list() {
  const users = await request<UserDTO[]>("/users")
  return users.map(toUser)
}

export async function create(input: NewUserInput) {
  await request("/users", {
    method: "POST",
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      registration: input.registration,
      type: roleToApi(input.role),
    },
  })
}

export async function update(input: UserUpdateInput) {
  await request(`/users/${input.id}`, {
    method: "PUT",
    body: {
      name: input.name,
      email: input.email,
      registration: input.registration,
      type: roleToApi(input.role),
      active: input.status === "active",
      password: input.password || undefined,
    },
  })
}
