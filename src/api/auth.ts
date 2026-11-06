import { request } from "./client"
import { toUser, type UserDTO } from "./mappers"

interface AuthResponse {
  token: string
}

export async function login(email: string, senha: string) {
  const { token } = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, senha },
    auth: false,
  })
  return token
}

export async function me() {
  return toUser(await request<UserDTO>("/auth/me"))
}

export async function register(input: {
  name: string
  email: string
  password: string
  registration: string
}) {
  await request("/auth/register", { method: "POST", body: input, auth: false })
}

export async function forgotPassword(email: string) {
  await request("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  })
}

export async function resetPassword(token: string, novaSenha: string) {
  await request("/auth/reset-password", {
    method: "POST",
    body: { token, novaSenha },
    auth: false,
  })
}
