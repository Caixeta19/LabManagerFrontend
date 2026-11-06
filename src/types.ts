export type UserRole = "student" | "professor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  registration: string
  role: UserRole
  status: "active" | "inactive"
  lastAccess: string
  initials: string
}

export interface Lab {
  id: string
  name: string
  location: string
  capacity: number
  status: "active" | "inactive" | "maintenance"
  description: string
  resources: string[]
  equipmentIds: string[]
  hours: string
}

export interface Equipment {
  id: string
  name: string
  tombstone: string
  labId: string
  labName: string
  status: "available" | "in_use" | "maintenance"
  responsible: string
}

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "expired"

export interface Reservation {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  labId: string
  labName: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  reason: string
  createdAt: string
}

export type LoanStatus = "active" | "overdue" | "returned"

export interface Loan {
  id: string
  userId: string
  equipmentId: string
  loanDate: string
  expectedReturn: string
  actualReturn?: string
  status: LoanStatus
}

export type Page = "login" | "register" | "forgot-password" | "reset-password" | "dashboard" | "labs" | "lab-detail" | "new-reservation" | "my-reservations" | "reservation-detail" | "qr-code" | "check-in" | "equipment" | "my-loans" | "all-reservations" | "admin-users" | "admin-labs" | "admin-equipment" | "admin-reservations" | "admin-loans"

export interface ToastMessage {
  id: number
  message: string
  type: "success" | "error" | "info"
}

export interface AppState {
  users: User[]
  labs: Lab[]
  equipment: Equipment[]
  reservations: Reservation[]
  loans: Loan[]
}
