import { useEffect, useState } from "react"
import { useApp } from "../context"
import { Btn, Input } from "../components/ui"
import logoImg from "@/imports/ChatGPT_Image_19_de_ago._de_2026__20_24_51.png"
import { ApiError, publicApi } from "../api"
import type { PublicSummary } from "../api/public"

type LoginState = "idle" | "loading" | "error"

const MSG_CONTA_BLOQUEADA =
  "Conta temporariamente bloqueada por segurança. Tente novamente mais tarde."

export default function Login() {
  const { login, showToast, navigate, handleError } = useApp()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loginState, setLoginState] = useState<LoginState>("idle")
  const [summary, setSummary] = useState<PublicSummary | null>(null)

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    form?: string
  }>({})

  useEffect(() => {
    publicApi
      .summary()
      .then(setSummary)
      .catch(() => {})
  }, [])

  function validate() {
    const e: typeof errors = {}

    if (!email) {
      e.email = "Informe o e-mail institucional."
    } else if (!email.includes("@")) {
      e.email = "E-mail inválido."
    }

    if (!password) {
      e.password = "Informe a senha."
    }

    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs = validate()

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setErrors({})
    setLoginState("loading")

    try {
      const user = await login(email.trim(), password)

      showToast(`Bem-vindo(a), ${user.name.split(" ")[0]}!`)
    } catch (error) {
      setLoginState("error")

      if (error instanceof ApiError && error.code === "ERR_AUTH_LOCKED") {
        setErrors({ form: MSG_CONTA_BLOQUEADA })
      } else if (error instanceof ApiError && error.status === 401) {
        setErrors({ form: error.message })
      } else if (error instanceof ApiError && error.status === 422) {
        setErrors({ email: error.fields.email, password: error.fields.senha })
      } else {
        handleError(error)
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* =====================================================
          LADO ESQUERDO
      ====================================================== */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{
          backgroundColor: "#1E4B5C",
        }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Lab Manager"
            className="bg-white rounded-xl p-1 object-contain"
            style={{
              width: 80,
              height: 80,
            }}
          />

          <span
            className="text-white tracking-wide"
            style={{
              fontWeight: 800,
              width: 169,
              height: 43,
              lineHeight: "60px",
              display: "inline-block",
            }}
          >
            LAB MANAGER
          </span>
        </div>

        {/* CONTEÚDO */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-800 text-white leading-tight mb-4">
              Gerencie laboratórios
              <br />
              com eficiência.
            </h2>

            <p className="text-white/60 text-lg leading-relaxed">
              Reservas, empréstimos de equipamentos e controle de acesso em um
              único sistema acadêmico.
            </p>
          </div>

          {/* =================================================
              CARDS DE ESTATÍSTICAS
          ================================================== */}
          <div className="grid grid-cols-2 gap-4">
            {/* =================================================
                LABORATÓRIOS
            ================================================== */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 10.5L12 4L20.5 10.5" />
                  <path d="M5.5 9.5V20H18.5V9.5" />
                  <path d="M9.5 20V14H14.5V20" />
                </svg>
              </div>

              <div className="text-2xl font-800 text-white">
                {summary?.laboratoriosAtivos ?? "—"}
              </div>

              <div className="text-white/50 text-xs font-500 mt-0.5">
                Laboratórios ativos
              </div>
            </div>

            {/* =================================================
                RESERVAS
            ================================================== */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
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
              </div>

              <div className="text-2xl font-800 text-white">
                {summary?.reservasHoje ?? "—"}
              </div>

              <div className="text-white/50 text-xs font-500 mt-0.5">
                Reservas hoje
              </div>
            </div>

            {/* =================================================
                EQUIPAMENTOS — CHAVE DE BOCA
            ================================================== */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
                </svg>
              </div>

              <div className="text-2xl font-800 text-white">
                {summary?.equipamentos ?? "—"}
              </div>

              <div className="text-white/50 text-xs font-500 mt-0.5">
                Equipamentos
              </div>
            </div>

            {/* =================================================
                USUÁRIOS
            ================================================== */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
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
              </div>

              <div className="text-2xl font-800 text-white">
                {summary?.usuarios ?? "—"}
              </div>

              <div className="text-white/50 text-xs font-500 mt-0.5">
                Usuários
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <p className="text-white/25 text-xs">
          © 2026 LAB MANAGER — Sistema de Gestão de Laboratórios
        </p>
      </div>

      {/* =====================================================
          LADO DIREITO — LOGIN
      ====================================================== */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
            {/* LOGO MOBILE */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img
                src={logoImg}
                alt="Lab Manager"
                className="w-9 h-9 object-contain"
              />

              <span className="font-800 text-primary text-base">
                LAB MANAGER
              </span>
            </div>

            {/* TÍTULO */}
            <div className="mb-8">
              <h1 className="text-2xl font-800 text-text">Entrar</h1>

              <p className="text-text-secondary text-sm mt-1">
                Acesse com seu e-mail institucional
              </p>
            </div>

            {/* ERRO */}
            {errors.form && (
              <div
                className="mb-6 p-4 rounded-xl border text-sm font-500"
                style={{
                  backgroundColor: "#FEF2F2",
                  borderColor: "#FCA5A5",
                  color: "#991B1B",
                }}
              >
                {errors.form}
              </div>
            )}

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-MAIL */}
              <Input
                label="E-mail institucional"
                type="email"
                placeholder="seu.nome@instituicao.edu.br"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors({})
                  setLoginState("idle")
                }}
                error={errors.email}
              />

              {/* SENHA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-600 text-text">Senha</label>

                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({})
                      setLoginState("idle")
                    }}
                    className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-text placeholder-text-secondary pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                      errors.password ? "border-danger" : "border-border"
                    }`}
                  />

                  {/* ÍCONE DE OLHO */}
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                  >
                    {showPw ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="text-xs text-danger">{errors.password}</span>
                )}
              </div>

              {/* BOTÃO ENTRAR */}
              <Btn
                type="submit"
                variant="primary"
                loading={loginState === "loading"}
                className="w-full justify-center py-3"
              >
                {loginState === "loading" ? "Entrando..." : "Entrar"}
              </Btn>

              {/* ESQUECI A SENHA */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("forgot-password")}
                  className="text-sm text-accent hover:underline font-500"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* CRIAR CONTA */}
              <div className="text-center pt-2">
                <span className="text-sm text-text-secondary">
                  Ainda não possui uma conta?{" "}
                </span>

                <button
                  type="button"
                  onClick={() => navigate("register")}
                  className="text-sm text-accent hover:underline font-600"
                >
                  Criar conta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
