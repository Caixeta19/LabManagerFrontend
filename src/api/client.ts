const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
const TOKEN_KEY = "labmanager.token"

const MSG_SEM_PERMISSAO = "Você não tem permissão para realizar esta ação."
const MSG_SEM_CONEXAO = "Não foi possível conectar ao servidor. Tente novamente."
const MSG_ERRO_GENERICO = "Ocorreu um erro inesperado. Tente novamente."

/** Erro padrão da API: `codigo`, `mensagem` e `erros[]` do back. */
export class ApiError extends Error {
  status: number
  code: string
  /** Erros por campo (422), com o nome do campo no DTO. */
  fields: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string> = {},
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

let unauthorizedHandler: ((code: string) => void) | null = null

/** Chamado quando uma requisição com token recebe 401: a sessão acabou. */
export function setUnauthorizedHandler(handler: (code: string) => void) {
  unauthorizedHandler = handler
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  /** `false` nas rotas públicas: não envia token e um 401 não encerra a sessão. */
  auth?: boolean
}

async function send(path: string, options: RequestOptions) {
  const { method = "GET", body, auth = true } = options
  const headers: Record<string, string> = {}
  const token = auth ? getToken() : null

  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "ERR_CONEXAO", MSG_SEM_CONEXAO)
  }

  if (!response.ok) {
    const error = await toApiError(response)
    if (response.status === 401 && token) unauthorizedHandler?.(error.code)
    throw error
  }

  return response
}

async function toApiError(response: Response) {
  const data = await response.json().catch(() => null)
  const code: string = data?.codigo ?? "ERR_DESCONHECIDO"

  if (response.status === 403) {
    return new ApiError(403, code, MSG_SEM_PERMISSAO)
  }

  const fields: Record<string, string> = {}
  for (const erro of data?.erros ?? []) {
    fields[erro.campo] = erro.mensagem
  }

  return new ApiError(
    response.status,
    code,
    data?.mensagem ?? MSG_ERRO_GENERICO,
    fields,
  )
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await send(path, options)
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function requestBlob(path: string): Promise<Blob> {
  const response = await send(path, {})
  return response.blob()
}
