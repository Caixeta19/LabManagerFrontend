import { useState } from "react"
import { useApp } from "../context"
import { Btn, Select, Modal } from "../components/ui"
import { ApiError } from "../api"
import { formatDate, todayISO } from "../utils"

const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
]

// Calendar mini-component
function MiniCalendar({
  selected,
  onChange,
}: {
  selected: string
  onChange: (d: string) => void
}) {
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const todayStr = todayISO()

  function pad(d: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(
      2,
      "0",
    )}-${String(d).padStart(2, "0")}`
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const cells: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 hover:bg-bg rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4 text-text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm font-700 text-text">
          {monthNames[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 hover:bg-bg rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4 text-text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-600 text-text-secondary py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={i} />
          }

          const dateStr = pad(d)
          const isPast = dateStr < todayStr
          const isSelected = dateStr === selected
          const isToday = dateStr === todayStr

          return (
            <button
              type="button"
              key={i}
              onClick={() => !isPast && onChange(dateStr)}
              disabled={isPast}
              className={`text-xs py-1.5 rounded-lg font-500 transition-colors ${
                isSelected
                  ? "bg-primary text-white font-700"
                  : isToday
                    ? "border border-accent text-accent"
                    : isPast
                      ? "text-text-secondary/30 cursor-not-allowed"
                      : "hover:bg-bg text-text"
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type Step = 1 | 2

export default function NewReservation() {
  const { state, currentUser, navigate, addReservation, pageParams, handleError } =
    useApp()

  const [step, setStep] = useState<Step>(1)

  const [labId, setLabId] = useState(pageParams.labId ?? "")

  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // NOVO: motivo da solicitação
  const [reason, setReason] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [processing, setProcessing] = useState(false)

  const [successModal, setSuccessModal] = useState(false)

  const activeLabs = state.labs.filter((l) => l.status === "active")

  function validateStep1() {
    const e: Record<string, string> = {}

    if (!labId) {
      e.labId = "Selecione um laboratório."
    }

    if (!date) {
      e.date = "Selecione uma data."
    }

    if (!startTime) {
      e.startTime = "Selecione o horário de início."
    }

    if (!endTime) {
      e.endTime = "Selecione o horário de término."
    }

    if (startTime && endTime && startTime >= endTime) {
      e.endTime = "O término deve ser após o início."
    }

    // NOVO: motivo obrigatório
    if (!reason.trim()) {
      e.reason = "Informe o motivo da solicitação."
    } else if (reason.trim().length < 10) {
      e.reason = "Explique um pouco melhor o motivo da solicitação."
    }

    return e
  }

  function handleNext() {
    const e = validateStep1()

    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setErrors({})

    setStep(2)
  }

  async function handleConfirm() {
    setProcessing(true)

    try {
      await addReservation({
        labId,
        date,
        startTime,
        endTime,
        reason: reason.trim(),
      })

      setSuccessModal(true)
    } catch (error) {
      if (error instanceof ApiError && error.code === "ERR_RESERVA_001") {
        setErrors({ conflict: error.message })
        setStep(1)
      } else if (error instanceof ApiError && error.status === 422) {
        setErrors({
          conflict: Object.values(error.fields)[0] ?? error.message,
        })
        setStep(1)
      } else {
        handleError(error)
      }
    } finally {
      setProcessing(false)
    }
  }

  const selectedLab = activeLabs.find((l) => l.id === labId)

  return (
    <div className="p-8 max-w-3xl">
      {/* =====================================================
          ETAPAS
      ====================================================== */}

      <div className="flex items-center gap-4 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 ${
                step >= s
                  ? "bg-primary text-white"
                  : "bg-border text-text-secondary"
              }`}
            >
              {s}
            </div>

            <span
              className={`text-sm font-600 ${
                step >= s ? "text-text" : "text-text-secondary"
              }`}
            >
              {s === 1 ? "Selecionar horário" : "Confirmar solicitação"}
            </span>

            {s < 2 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* =====================================================
          ETAPA 1
      ====================================================== */}

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-base font-700 text-text mb-5">
              Selecione o laboratório e horário
            </h2>

            <div className="space-y-5">
              {/* LABORATÓRIO */}

              <Select
                label="Laboratório"
                value={labId}
                onChange={(e) => {
                  setLabId(e.target.value)
                  setErrors({})
                }}
                error={errors.labId}
              >
                <option value="">Selecione um laboratório</option>

                {activeLabs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.location}
                  </option>
                ))}
              </Select>

              {/* DATA */}

              <div>
                <label className="text-sm font-600 text-text block mb-1.5">
                  Data
                </label>

                <MiniCalendar
                  selected={date}
                  onChange={(d) => {
                    setDate(d)
                    setErrors({})
                  }}
                />

                {errors.date && (
                  <span className="text-xs text-danger mt-1 block">
                    {errors.date}
                  </span>
                )}
              </div>

              {/* HORÁRIOS */}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Horário de início"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    setErrors({})
                  }}
                  error={errors.startTime}
                >
                  <option value="">Selecione</option>

                  {TIME_SLOTS.slice(0, -1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Horário de término"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value)
                    setErrors({})
                  }}
                  error={errors.endTime}
                >
                  <option value="">Selecione</option>

                  {TIME_SLOTS.slice(1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              {/* =================================================
                  NOVO: MOTIVO DA SOLICITAÇÃO
              ================================================== */}

              <div>
                <label className="text-sm font-600 text-text block mb-1.5">
                  Motivo da solicitação
                </label>

                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)

                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.reason
                      return next
                    })
                  }}
                  placeholder="Explique por que você precisa utilizar este laboratório..."
                  rows={5}
                  maxLength={500}
                  className={`w-full px-3 py-3 text-sm bg-white border rounded-xl text-text placeholder-text-secondary resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                    errors.reason ? "border-danger" : "border-border"
                  }`}
                />

                <div className="flex items-center justify-between mt-1.5">
                  {errors.reason ? (
                    <span className="text-xs text-danger">{errors.reason}</span>
                  ) : (
                    <span className="text-xs text-text-secondary">
                      Informe o objetivo da utilização do laboratório.
                    </span>
                  )}

                  <span className="text-xs text-text-secondary">
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {/* CONFLITO */}

              {errors.conflict && (
                <div
                  className="p-4 rounded-xl border text-sm font-500"
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderColor: "#FCA5A5",
                    color: "#991B1B",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>

                    {errors.conflict}
                  </div>
                </div>
              )}

              {/* HORÁRIO DISPONÍVEL */}

              {labId &&
                date &&
                startTime &&
                endTime &&
                !errors.conflict &&
                startTime < endTime && (
                  <div
                    className="p-4 rounded-xl border text-sm font-500"
                    style={{
                      backgroundColor: "#D1FAE5",
                      borderColor: "#6EE7B7",
                      color: "#065F46",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Prossiga para enviar a solicitação. A disponibilidade é
                      confirmada no envio.
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* BOTÃO */}

          <div className="flex justify-end">
            <Btn onClick={handleNext}>Próximo passo →</Btn>
          </div>
        </div>
      )}

      {/* =====================================================
          ETAPA 2 — CONFIRMAÇÃO
      ====================================================== */}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-base font-700 text-text mb-5">
              Revisar solicitação
            </h2>

            <div className="space-y-3">
              {[
                {
                  label: "Laboratório",
                  value: selectedLab?.name,
                },

                {
                  label: "Localização",
                  value: selectedLab?.location,
                },

                {
                  label: "Data",
                  value: formatDate(date),
                },

                {
                  label: "Horário",
                  value: `${startTime} – ${endTime}`,
                },

                {
                  label: "Solicitante",
                  value: currentUser?.name,
                },

                {
                  label: "E-mail",
                  value: currentUser?.email,
                },

                {
                  label: "Status inicial",
                  value: "Pendente (aguarda confirmação)",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 text-sm"
                >
                  <span className="text-text-secondary font-500">{label}</span>

                  <span className="font-600 text-text text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* MOTIVO */}

            <div className="mt-5">
              <div className="text-sm text-text-secondary font-500 mb-2">
                Motivo da solicitação
              </div>

              <div className="p-4 rounded-xl bg-bg border border-border text-sm text-text leading-relaxed">
                {reason}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-bg text-xs text-text-secondary">
              A reserva ficará pendente até você confirmá-la pelo link enviado
              por e-mail cerca de 1 hora antes do início. Sem a confirmação, ela
              expira e o check-in não funciona.
            </div>
          </div>

          {/* BOTÕES */}

          <div className="flex justify-between">
            <Btn variant="secondary" onClick={() => setStep(1)}>
              ← Voltar
            </Btn>

            <Btn loading={processing} onClick={handleConfirm}>
              Enviar solicitação
            </Btn>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL DE SUCESSO
      ====================================================== */}

      <Modal
        open={successModal}
        onClose={() => {
          setSuccessModal(false)
          navigate("my-reservations")
        }}
        title="Solicitação enviada!"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="text-lg font-700 text-text mb-2">
            Solicitação enviada com sucesso!
          </h3>

          <p className="text-sm text-text-secondary mb-1">
            Sua solicitação para o <strong>{selectedLab?.name}</strong> para o
            dia <strong>{formatDate(date)}</strong> ({startTime}–{endTime}) foi
            registrada.
          </p>

          <p className="text-sm text-text-secondary mb-1">
            O motivo informado foi:
          </p>

          <div className="text-sm text-text font-500 bg-bg rounded-xl p-3 mb-6 text-left">
            {reason}
          </div>

          <p className="text-sm text-text-secondary mb-6">
            O status está <strong>Pendente</strong>. Você receberá o link de
            confirmação por e-mail cerca de 1 hora antes do início.
          </p>

          <Btn
            className="w-full justify-center"
            onClick={() => {
              setSuccessModal(false)
              navigate("my-reservations")
            }}
          >
            Ver minhas reservas
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
