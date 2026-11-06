import type {
  Equipment,
  Lab,
  Loan,
  LoanStatus,
  Reservation,
  ReservationStatus,
  User,
  UserRole,
} from "../types"
import { initialsOf, formatDateTime } from "../utils"

// ─── DTOs do back ─────────────────────────────────────────────────────────────

export type ApiUserType = "ALUNO" | "PROFESSOR" | "ADMIN"
export type ApiLabStatus = "ATIVO" | "INATIVO" | "MANUTENCAO"
export type ApiEquipmentStatus = "DISPONIVEL" | "EM_USO" | "MANUTENCAO"
export type ApiReserveStatus =
  | "PENDENTE"
  | "CONFIRMADA"
  | "CANCELADA"
  | "EXPIRADA"
export type ApiLoanStatus = "ATIVO" | "ATRASADO" | "DEVOLVIDO"

export interface UserDTO {
  id: string
  name: string
  email: string
  registration: string
  type: ApiUserType
  active: boolean
  lastLoginAt: string | null
}

export interface LabDTO {
  id: string
  name: string
  localization: string
  capacity: number
  description: string | null
  active: boolean
  status: ApiLabStatus
  openingHours: string | null
  resources: string[]
}

export interface EquipmentDTO {
  id: string
  name: string
  heritage: string
  description: string | null
  laboratoryId: string
  laboratoryName: string
  status: ApiEquipmentStatus
  responsible: string | null
}

export interface ReserveDTO {
  id: string
  laboratoryId: string
  laboratoryName: string
  userId: string
  userName: string
  dataHoraInicio: string
  dataHoraFim: string
  status: ApiReserveStatus
  dataConfirmacao: string | null
  userType: ApiUserType
  reason: string | null
  createdAt: string
}

export interface LoanDTO {
  id: string
  equipmentId: string
  equipmentName: string
  heritage: string
  userId: string
  userName: string
  dataRetirada: string
  dataDevolucaoPrevista: string
  dataDevolucaoReal: string | null
  status: ApiLoanStatus
}

// ─── Enums ────────────────────────────────────────────────────────────────────

const ROLE_FROM_API: Record<ApiUserType, UserRole> = {
  ALUNO: "student",
  PROFESSOR: "professor",
  ADMIN: "admin",
}

const ROLE_TO_API: Record<UserRole, ApiUserType> = {
  student: "ALUNO",
  professor: "PROFESSOR",
  admin: "ADMIN",
}

const LAB_STATUS_FROM_API: Record<ApiLabStatus, Lab["status"]> = {
  ATIVO: "active",
  INATIVO: "inactive",
  MANUTENCAO: "maintenance",
}

const LAB_STATUS_TO_API: Record<Lab["status"], ApiLabStatus> = {
  active: "ATIVO",
  inactive: "INATIVO",
  maintenance: "MANUTENCAO",
}

const EQUIPMENT_STATUS_FROM_API: Record<
  ApiEquipmentStatus,
  Equipment["status"]
> = {
  DISPONIVEL: "available",
  EM_USO: "in_use",
  MANUTENCAO: "maintenance",
}

const EQUIPMENT_STATUS_TO_API: Record<
  Equipment["status"],
  ApiEquipmentStatus
> = {
  available: "DISPONIVEL",
  in_use: "EM_USO",
  maintenance: "MANUTENCAO",
}

const RESERVATION_STATUS_FROM_API: Record<ApiReserveStatus, ReservationStatus> =
  {
    PENDENTE: "pending",
    CONFIRMADA: "confirmed",
    CANCELADA: "cancelled",
    EXPIRADA: "expired",
  }

const LOAN_STATUS_FROM_API: Record<ApiLoanStatus, LoanStatus> = {
  ATIVO: "active",
  ATRASADO: "overdue",
  DEVOLVIDO: "returned",
}

export function roleToApi(role: UserRole) {
  return ROLE_TO_API[role]
}

// ─── DTO → front ──────────────────────────────────────────────────────────────

const datePart = (dateTime: string) => dateTime.slice(0, 10)
const timePart = (dateTime: string) => dateTime.slice(11, 16)

export function toUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    registration: dto.registration,
    role: ROLE_FROM_API[dto.type],
    status: dto.active ? "active" : "inactive",
    lastAccess: dto.lastLoginAt ? formatDateTime(dto.lastLoginAt) : "—",
    initials: initialsOf(dto.name),
  }
}

/** `equipmentIds` é preenchido pelo contexto, a partir de `equipment.labId`. */
export function toLab(dto: LabDTO): Lab {
  return {
    id: dto.id,
    name: dto.name,
    location: dto.localization,
    capacity: dto.capacity,
    status: LAB_STATUS_FROM_API[dto.status],
    description: dto.description ?? "",
    resources: dto.resources,
    equipmentIds: [],
    hours: dto.openingHours ?? "",
  }
}

export function toEquipment(dto: EquipmentDTO): Equipment {
  return {
    id: dto.id,
    name: dto.name,
    tombstone: dto.heritage,
    labId: dto.laboratoryId,
    labName: dto.laboratoryName,
    status: EQUIPMENT_STATUS_FROM_API[dto.status],
    responsible: dto.responsible ?? "",
  }
}

export function toReservation(dto: ReserveDTO): Reservation {
  return {
    id: dto.id,
    userId: dto.userId,
    userName: dto.userName,
    userRole: ROLE_FROM_API[dto.userType],
    labId: dto.laboratoryId,
    labName: dto.laboratoryName,
    date: datePart(dto.dataHoraInicio),
    startTime: timePart(dto.dataHoraInicio),
    endTime: timePart(dto.dataHoraFim),
    status: RESERVATION_STATUS_FROM_API[dto.status],
    reason: dto.reason ?? "",
    createdAt: `${datePart(dto.createdAt)} ${timePart(dto.createdAt)}`,
  }
}

export function toLoan(dto: LoanDTO): Loan {
  return {
    id: dto.id,
    userId: dto.userId,
    equipmentId: dto.equipmentId,
    loanDate: datePart(dto.dataRetirada),
    expectedReturn: dto.dataDevolucaoPrevista,
    actualReturn: dto.dataDevolucaoReal
      ? datePart(dto.dataDevolucaoReal)
      : undefined,
    status: LOAN_STATUS_FROM_API[dto.status],
  }
}

// ─── Front → DTO ──────────────────────────────────────────────────────────────

export function labToRequest(lab: LabInput) {
  return {
    name: lab.name,
    localization: lab.location,
    capacity: lab.capacity,
    description: lab.description,
    openingHours: lab.hours,
    resources: lab.resources,
    status: LAB_STATUS_TO_API[lab.status],
  }
}

export function equipmentToRequest(equipment: EquipmentInput) {
  return {
    name: equipment.name,
    heritage: equipment.tombstone,
    laboratoryId: equipment.labId,
    responsible: equipment.responsible,
    status: EQUIPMENT_STATUS_TO_API[equipment.status],
  }
}

export type LabInput = Pick<
  Lab,
  | "name"
  | "location"
  | "capacity"
  | "description"
  | "hours"
  | "resources"
  | "status"
>

export type EquipmentInput = Pick<
  Equipment,
  "name" | "tombstone" | "labId" | "responsible" | "status"
>

export interface NewUserInput {
  name: string
  email: string
  password: string
  registration: string
  role: UserRole
}

export interface UserUpdateInput {
  id: string
  name: string
  email: string
  registration: string
  role: UserRole
  status: User["status"]
  /** Só enviada quando preenchida; sem ela, a senha atual é mantida. */
  password?: string
}

export interface NewReservationInput {
  labId: string
  date: string
  startTime: string
  endTime: string
  reason: string
}

export interface NewLoanInput {
  equipmentId: string
  expectedReturn: string
}
