import { useApp } from "../context"
import {
  ReservationBadge,
  LoanBadge,
  Btn,
  AlertBanner,
  EmptyState,
} from "../components/ui"
import { formatDate, getLabById, getEquipmentById } from "../data"

type IconProps = {
  size?: number
  className?: string
}

// ÍCONE: Laboratórios ativos
function LabIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10.5L12 4L20.5 10.5" />
      <path d="M5.5 9.5V20H18.5V9.5" />
      <path d="M9.5 20V14H14.5V20" />
    </svg>
  )
}

// ÍCONE: Reservas hoje
function CalendarIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M8 3V7" />
      <path d="M16 3V7" />
      <path d="M4 10H20" />
    </svg>
  )
}

// ÍCONE: Equipamentos / Empréstimos ativos
function WrenchIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3C15.1 5.3 16 4.4 17.2 4C18.5 3.6 19.9 4 20.8 5L17.2 8.6" />
      <path d="M17.2 8.6L20 11.4" />
      <path d="M13.6 10.4L5 19" />
      <path d="M3.5 20.5L5 19" />
      <path d="M5 17L8 20" />
    </svg>
  )
}

// ÍCONE: Usuários / Reservas pendentes
function UsersIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20C3.5 16.7 5.7 14.5 9 14.5C12.3 14.5 14.5 16.7 14.5 20" />
      <path d="M16 5.5C17.7 5.5 19 6.8 19 8.5C19 10.2 17.7 11.5 16 12" />
      <path d="M16 15C18.8 15.3 20.5 17 20.5 20" />
    </svg>
  )
}

// ÍCONE: Empréstimos atrasados
function AlertIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L21 20H3L12 3Z" />
      <path d="M12 9V13" />
      <path d="M12 16.5H12.01" />
    </svg>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
  onClick,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
  onClick?: () => void
  icon?: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-border p-6 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
    >
      {icon && <div className="mb-2">{icon}</div>}

      <div
        className="text-3xl font-800 mb-1"
        style={{
          color: color ?? "#1E4B5C",
        }}
      >
        {value}
      </div>

      <div className="text-sm font-600 text-text">{label}</div>

      {sub && <div className="text-xs text-text-secondary mt-1">{sub}</div>}
    </div>
  )
}

// Simple bar chart using CSS
function ReservationChart({
  reservations,
}: {
  reservations: ReturnType<typeof useApp>["state"]["reservations"]
}) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"]
  const counts = days.map((_, i) => Math.floor(Math.random() * 8) + 2)
  const max = Math.max(...counts)

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-base font-700 text-text mb-1">Reservas por dia</h3>

      <p className="text-xs text-text-secondary mb-6">Esta semana</p>

      <div className="flex items-end gap-3 h-32">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${(counts[i] / max) * 100}%`,
                backgroundColor: "#3FA796",
                opacity: 0.85,
              }}
            />

            <span className="text-xs text-text-secondary font-500">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { state, currentUser, navigate } = useApp()

  if (!currentUser) return null

  const isAdmin = currentUser.role === "admin"

  const userReservations = isAdmin
    ? state.reservations
    : state.reservations.filter((r) => r.userId === currentUser.id)

  const userLoans = isAdmin
    ? state.loans
    : state.loans.filter((l) => l.userId === currentUser.id)

  const upcoming = userReservations
    .filter((r) => r.status === "confirmed" || r.status === "pending")
    .slice(0, 5)

  const activeLoans = userLoans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  )

  const overdueLoans = userLoans.filter((l) => l.status === "overdue")

  const nextReturn = activeLoans.sort((a, b) =>
    a.expectedReturn.localeCompare(b.expectedReturn),
  )[0]

  if (isAdmin) {
    // Admin dashboard
    const pendingReservations = state.reservations.filter(
      (r) => r.status === "pending",
    )

    const todayStr = new Date().toISOString().split("T")[0]

    const todayReservations = state.reservations.filter(
      (r) => r.date === todayStr,
    )

    const activeLabs = state.labs.filter((l) => l.status === "active")

    return (
      <div className="p-8 space-y-8">
        {/* CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Laboratórios ativos"
            value={activeLabs.length}
            color="#1E4B5C"
            icon={<LabIcon size={18} />}
          />

          <StatCard
            label="Reservas hoje"
            value={todayReservations.length}
            color="#3FA796"
            icon={<CalendarIcon size={18} />}
          />

          <StatCard
            label="Reservas pendentes"
            value={pendingReservations.length}
            color="#E3A008"
            icon={<UsersIcon size={18} />}
          />

          <StatCard
            label="Empréstimos ativos"
            value={state.loans.filter((l) => l.status === "active").length}
            color="#1E4B5C"
            icon={<WrenchIcon size={18} />}
          />

          <StatCard
            label="Empréstimos atrasados"
            value={state.loans.filter((l) => l.status === "overdue").length}
            color="#C4433A"
            icon={<AlertIcon size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReservationChart reservations={state.reservations} />

          {/* Lab distribution */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-base font-700 text-text mb-1">
              Reservas por laboratório
            </h3>

            <p className="text-xs text-text-secondary mb-6">Total acumulado</p>

            <div className="space-y-4">
              {state.labs.map((lab) => {
                const count = state.reservations.filter(
                  (r) => r.labId === lab.id,
                ).length

                const total = state.reservations.length || 1

                return (
                  <div key={lab.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-500 text-text">{lab.name}</span>

                      <span className="font-600 text-text-secondary">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 bg-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${(count / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-base font-700 text-text mb-5">
            Atividades recentes
          </h3>

          <div className="space-y-3">
            {state.reservations
              .slice(-5)
              .reverse()
              .map((r) => {
                const user = state.users.find((u) => u.id === r.userId)

                const lab = getLabById(state.labs, r.labId)

                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-700 text-xs flex items-center justify-center">
                        {user?.initials}
                      </div>

                      <div>
                        <div className="text-sm font-500 text-text">
                          {user?.name} — {lab?.name}
                        </div>

                        <div className="text-xs text-text-secondary">
                          {formatDate(r.date)} · {r.startTime}–{r.endTime}
                        </div>
                      </div>
                    </div>

                    <ReservationBadge status={r.status} />
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    )
  }

  // Student/Professor dashboard
  return (
    <div className="p-8 space-y-8">
      {overdueLoans.length > 0 && (
        <AlertBanner
          type="error"
          message={`Você tem ${overdueLoans.length} empréstimo(s) em atraso. Devolva os equipamentos o quanto antes para evitar penalidades.`}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Próximas reservas"
          value={upcoming.length}
          sub={
            upcoming.length > 0
              ? `Próxima: ${formatDate(upcoming[0]?.date)}`
              : "Nenhuma agendada"
          }
          color="#1E4B5C"
          onClick={() => navigate("my-reservations")}
          icon={<CalendarIcon size={18} />}
        />

        <StatCard
          label="Empréstimos ativos"
          value={activeLoans.length}
          sub={
            activeLoans.length > 0
              ? `${overdueLoans.length} em atraso`
              : "Tudo em dia"
          }
          color={overdueLoans.length > 0 ? "#C4433A" : "#2E9E5B"}
          onClick={() => navigate("my-loans")}
          icon={<WrenchIcon size={18} />}
        />

        <StatCard
          label="Próxima devolução"
          value={nextReturn ? formatDate(nextReturn.expectedReturn) : "—"}
          sub={
            nextReturn
              ? getEquipmentById(state.equipment, nextReturn.equipmentId)?.name
              : "Sem devoluções pendentes"
          }
          color="#E3A008"
          onClick={() => navigate("my-loans")}
          icon={<CalendarIcon size={18} />}
        />

        <div
          onClick={() => navigate("new-reservation")}
          className="bg-primary rounded-2xl p-6 cursor-pointer hover:bg-primary-hover transition-colors flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </div>

          <div>
            <div className="text-white font-700 text-sm">Nova reserva</div>

            <div className="text-white/60 text-xs mt-0.5">
              Reserve um laboratório
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming reservations table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-700 text-text">
              Suas próximas reservas
            </h3>

            <p className="text-xs text-text-secondary mt-0.5">
              Reservas confirmadas e pendentes
            </p>
          </div>

          <Btn
            variant="secondary"
            size="sm"
            onClick={() => navigate("my-reservations")}
          >
            Ver todas
          </Btn>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Nenhuma reserva próxima"
            description="Você não tem reservas agendadas no momento."
            action={
              <Btn onClick={() => navigate("new-reservation")}>
                Nova reserva
              </Btn>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border">
                <th className="px-6 py-3">Laboratório</th>

                <th className="px-6 py-3">Data</th>

                <th className="px-6 py-3">Horário</th>

                <th className="px-6 py-3">Status</th>

                <th className="px-6 py-3">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {upcoming.map((r) => {
                const lab = getLabById(state.labs, r.labId)

                return (
                  <tr key={r.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-text">
                      {lab?.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(r.date)}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {r.startTime}–{r.endTime}
                    </td>

                    <td className="px-6 py-4">
                      <ReservationBadge status={r.status} />
                    </td>

                    <td className="px-6 py-4">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate("reservation-detail", { id: r.id })
                        }
                      >
                        Detalhes
                      </Btn>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
