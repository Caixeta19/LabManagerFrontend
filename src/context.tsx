import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type {
  AppState,
  Equipment,
  Lab,
  Page,
  Reservation,
  ToastMessage,
  User,
} from "./types"
import {
  ApiError,
  authApi,
  equipmentApi,
  labsApi,
  loansApi,
  reservationsApi,
  usersApi,
} from "./api"
import { clearToken, getToken, setToken, setUnauthorizedHandler } from "./api/client"
import type {
  EquipmentInput,
  LabInput,
  NewLoanInput,
  NewReservationInput,
  NewUserInput,
  UserUpdateInput,
} from "./api/mappers"
import { initialsOf } from "./utils"

type DataStatus = "idle" | "loading" | "ready" | "error"
type DataKey = keyof AppState

const MSG_SESSAO_EXPIRADA = "Sua sessão expirou. Faça login novamente."
const ALL_KEYS: DataKey[] = ["users", "labs", "equipment", "reservations", "loans"]
const EMPTY_STATE: AppState = {
  users: [],
  labs: [],
  equipment: [],
  reservations: [],
  loans: [],
}

interface AppContextValue {
  state: AppState
  currentUser: User | null
  /** `true` enquanto a sessão salva é restaurada, antes de saber se há usuário logado. */
  booting: boolean
  dataStatus: DataStatus
  page: Page
  pageParams: Record<string, string>
  toasts: ToastMessage[]
  navigate: (page: Page, params?: Record<string, string>) => void
  showToast: (message: string, type?: ToastMessage["type"]) => void
  /** Aviso padrão para um erro da API. Um 401 já foi tratado pelo cliente e não gera aviso. */
  handleError: (error: unknown) => void
  reload: (keys?: DataKey[]) => Promise<void>
  login: (email: string, senha: string) => Promise<User>
  logout: () => void
  addReservation: (input: NewReservationInput) => Promise<void>
  cancelReservation: (id: string) => Promise<void>
  addLoan: (input: NewLoanInput) => Promise<void>
  returnLoan: (id: string) => Promise<void>
  addUser: (input: NewUserInput) => Promise<void>
  updateUser: (input: UserUpdateInput) => Promise<void>
  addLab: (input: LabInput) => Promise<void>
  updateLab: (id: string, input: LabInput) => Promise<void>
  addEquipment: (input: EquipmentInput) => Promise<void>
  updateEquipment: (id: string, input: EquipmentInput) => Promise<void>
}

const AppContext = createContext<AppContextValue>(null!)

let toastIdCounter = 1

/** O link do e-mail é a única URL que a aplicação lê; o resto da navegação é por estado. */
function initialRoute(): { page: Page; params: Record<string, string> } {
  if (window.location.pathname === "/redefinir-senha") {
    const token = new URLSearchParams(window.location.search).get("token") ?? ""
    return { page: "reset-password", params: { token } }
  }
  return { page: "login", params: {} }
}

function fetchKey(key: DataKey, user: User): Promise<AppState[DataKey]> {
  const isAdmin = user.role === "admin"

  switch (key) {
    case "users":
      return isAdmin ? usersApi.list() : Promise.resolve([])
    case "labs":
      return isAdmin ? labsApi.listAll() : labsApi.list()
    case "equipment":
      return equipmentApi.list()
    case "reservations":
      return user.role === "student"
        ? reservationsApi.mine()
        : reservationsApi.list()
    case "loans":
      return isAdmin ? loansApi.list() : loansApi.mine()
  }
}

/** Quem não é ADMIN não acessa `/users`: a lista sai das próprias reservas. */
function usersFromReservations(reservations: Reservation[], current: User) {
  const users = new Map<string, User>([[current.id, current]])

  for (const r of reservations) {
    if (users.has(r.userId)) continue
    users.set(r.userId, {
      id: r.userId,
      name: r.userName,
      email: "",
      registration: "",
      role: r.userRole,
      status: "active",
      lastAccess: "—",
      initials: initialsOf(r.userName),
    })
  }

  return [...users.values()]
}

function withEquipmentIds(labs: Lab[], equipment: Equipment[]) {
  return labs.map((lab) => ({
    ...lab,
    equipmentIds: equipment.filter((e) => e.labId === lab.id).map((e) => e.id),
  }))
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [route] = useState(initialRoute)
  const [data, setData] = useState<AppState>(EMPTY_STATE)
  const [dataStatus, setDataStatus] = useState<DataStatus>("idle")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(() => getToken() !== null)
  const [page, setPage] = useState<Page>(route.page)
  const [pageParams, setPageParams] = useState(route.params)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Respostas de uma sessão que já terminou são descartadas
  const sessionRef = useRef(0)
  const userRef = useRef<User | null>(null)

  const navigate = useCallback((p: Page, params: Record<string, string> = {}) => {
    setPage(p)
    setPageParams(params)
    window.scrollTo(0, 0)
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      const id = toastIdCounter++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    },
    [],
  )

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.status === 401) return
        showToast(Object.values(error.fields)[0] ?? error.message, "error")
        return
      }
      showToast("Ocorreu um erro inesperado. Tente novamente.", "error")
    },
    [showToast],
  )

  const endSession = useCallback(() => {
    sessionRef.current += 1
    userRef.current = null
    clearToken()
    setCurrentUser(null)
    setData(EMPTY_STATE)
    setDataStatus("idle")
    setPage("login")
    setPageParams({})
  }, [])

  const reload = useCallback(async (keys: DataKey[] = ALL_KEYS) => {
    const user = userRef.current
    if (!user) return

    const session = sessionRef.current
    const results = await Promise.all(keys.map((key) => fetchKey(key, user)))
    if (session !== sessionRef.current) return

    setData((prev) => {
      const next = { ...prev }
      keys.forEach((key, i) => {
        ;(next[key] as AppState[DataKey]) = results[i]
      })
      return next
    })
  }, [])

  const startSession = useCallback(
    async (user: User) => {
      sessionRef.current += 1
      userRef.current = user
      setCurrentUser(user)
      setDataStatus("loading")
      try {
        await reload()
        setDataStatus("ready")
      } catch {
        setDataStatus("error")
      }
    },
    [reload],
  )

  const retryLoad = useCallback(async () => {
    if (userRef.current) await startSession(userRef.current)
  }, [startSession])

  // 401 em qualquer requisição autenticada encerra a sessão
  useEffect(() => {
    setUnauthorizedHandler((code) => {
      if (!userRef.current && !getToken()) return
      endSession()
      if (code === "ERR_JWT_EXPIRED") showToast(MSG_SESSAO_EXPIRADA, "info")
    })
  }, [endSession, showToast])

  // Restaura a sessão ao recarregar a página
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current || !getToken()) return
    restoredRef.current = true

    authApi
      .me()
      .then((user) => {
        if (route.page === "login") setPage("dashboard")
        return startSession(user)
      })
      .catch(handleError)
      .finally(() => setBooting(false))
  }, [route.page, startSession, handleError])

  // Atualiza ao voltar para a aba: a confirmação da reserva acontece no link do e-mail
  useEffect(() => {
    const onFocus = () => {
      reload().catch(() => undefined)
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [reload])

  const login = useCallback(
    async (email: string, senha: string) => {
      setToken(await authApi.login(email, senha))
      const user = await authApi.me()
      setPage("dashboard")
      setPageParams({})
      await startSession(user)
      return user
    },
    [startSession],
  )

  const addReservation = useCallback(
    async (input: NewReservationInput) => {
      await reservationsApi.create(input)
      await reload(["reservations"])
    },
    [reload],
  )

  const cancelReservation = useCallback(
    async (id: string) => {
      await reservationsApi.cancel(id)
      await reload(["reservations"])
    },
    [reload],
  )

  const addLoan = useCallback(
    async (input: NewLoanInput) => {
      await loansApi.create(input)
      await reload(["loans", "equipment"])
    },
    [reload],
  )

  const returnLoan = useCallback(
    async (id: string) => {
      await loansApi.returnEquipment(id)
      await reload(["loans", "equipment"])
    },
    [reload],
  )

  const addUser = useCallback(
    async (input: NewUserInput) => {
      await usersApi.create(input)
      await reload(["users"])
    },
    [reload],
  )

  const updateUser = useCallback(
    async (input: UserUpdateInput) => {
      await usersApi.update(input)

      const current = userRef.current
      if (current?.id !== input.id) {
        await reload(["users"])
        return
      }

      // O JWT guarda o e-mail: depois de trocar o próprio e-mail, o token atual deixa de valer
      if (current.email !== input.email.trim().toLowerCase()) {
        endSession()
        showToast("E-mail alterado. Entre novamente.", "info")
        return
      }

      const user = await authApi.me()
      userRef.current = user
      setCurrentUser(user)
      await reload()
    },
    [reload, endSession, showToast],
  )

  const addLab = useCallback(
    async (input: LabInput) => {
      await labsApi.create(input)
      await reload(["labs"])
    },
    [reload],
  )

  const updateLab = useCallback(
    async (id: string, input: LabInput) => {
      await labsApi.update(id, input)
      await reload(["labs"])
    },
    [reload],
  )

  const addEquipment = useCallback(
    async (input: EquipmentInput) => {
      await equipmentApi.create(input)
      await reload(["equipment"])
    },
    [reload],
  )

  const updateEquipment = useCallback(
    async (id: string, input: EquipmentInput) => {
      await equipmentApi.update(id, input)
      await reload(["equipment"])
    },
    [reload],
  )

  const state = useMemo<AppState>(
    () => ({
      ...data,
      labs: withEquipmentIds(data.labs, data.equipment),
      users:
        currentUser && currentUser.role !== "admin"
          ? usersFromReservations(data.reservations, currentUser)
          : data.users,
    }),
    [data, currentUser],
  )

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        booting,
        dataStatus,
        page,
        pageParams,
        toasts,
        navigate,
        showToast,
        handleError,
        reload: useCallback(
          (keys?: DataKey[]) => (keys ? reload(keys) : retryLoad()),
          [reload, retryLoad],
        ),
        login,
        logout: endSession,
        addReservation,
        cancelReservation,
        addLoan,
        returnLoan,
        addUser,
        updateUser,
        addLab,
        updateLab,
        addEquipment,
        updateEquipment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
