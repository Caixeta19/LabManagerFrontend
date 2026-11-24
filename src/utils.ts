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

export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
/** Segunda primeiro, como no calendário acadêmico. */
export const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]

/** Dia da semana (0 = domingo) de uma data "AAAA-MM-DD", sem passar por UTC. */
export function diaDaSemana(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** "Seg–Sex", "Seg, Qua, Sex", "Seg–Qua, Sáb" ou "Todos os dias". */
export function formatarDias(dias: number[]) {
  if (dias.length === 0 || dias.length === 7) return "Todos os dias"
  const ordenados = ORDEM_DIAS.filter((d) => dias.includes(d))
  const partes: string[] = []
  let ini = 0
  for (let i = 1; i <= ordenados.length; i++) {
    const anterior = ORDEM_DIAS.indexOf(ordenados[i - 1])
    if (i < ordenados.length && ORDEM_DIAS.indexOf(ordenados[i]) === anterior + 1) continue
    const a = ordenados[ini]
    const b = ordenados[i - 1]
    if (a === b) partes.push(DIAS_CURTOS[a])
    else if (i - 1 - ini === 1) partes.push(DIAS_CURTOS[a], DIAS_CURTOS[b])
    else partes.push(`${DIAS_CURTOS[a]}–${DIAS_CURTOS[b]}`)
    ini = i
  }
  return partes.join(", ")
}

/** Funcionamento do laboratório (a regra que vale nas reservas): dias e horário. Sem nada definido, a observação livre. */
export function labHorarioResumo(lab: Lab) {
  const temDias = lab.bookingDays.length > 0 && lab.bookingDays.length < 7
  const temHorario = !!(lab.bookingOpenTime && lab.bookingCloseTime)
  if (!temDias && !temHorario) return lab.hours || "Horário não informado"
  const horario = temHorario ? `${lab.bookingOpenTime}–${lab.bookingCloseTime}` : "qualquer horário"
  return `${formatarDias(lab.bookingDays)} · ${horario}`
}
