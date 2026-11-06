import type { Equipment, Lab, User } from "./types"

const TIME_ZONE = "America/Sao_Paulo"

/** `yyyy-MM-dd` em Brasília, deslocado em `offsetDays`. Calculado em UTC para não sofrer com fuso. */
function isoDate(offsetDays: number) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  if (offsetDays === 0) return today

  const [year, month, day] = today.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day + offsetDays))
    .toISOString()
    .slice(0, 10)
}

export function todayISO() {
  return isoDate(0)
}

export function tomorrowISO() {
  return isoDate(1)
}

/** Datas de segunda a sexta da semana atual, em Brasília. */
export function currentWeekdays() {
  const [year, month, day] = todayISO().split("-").map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const toMonday = weekday === 0 ? -6 : 1 - weekday

  return [0, 1, 2, 3, 4].map((i) => isoDate(toMonday + i))
}

export function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

/** Aceita `yyyy-MM-ddTHH:mm:ss` e `yyyy-MM-dd HH:mm`. */
export function formatDateTime(dateTime: string) {
  return `${formatDate(dateTime.slice(0, 10))} ${dateTime.slice(11, 16)}`
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function checkPassword(password: string) {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= 64,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export function getLabById(labs: Lab[], id: string) {
  return labs.find((l) => l.id === id)
}

export function getUserById(users: User[], id: string) {
  return users.find((u) => u.id === id)
}

export function getEquipmentById(equipment: Equipment[], id: string) {
  return equipment.find((e) => e.id === id)
}
