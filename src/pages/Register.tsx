import { useState } from "react"
import { useApp } from "../context"
import { Btn, Input } from "../components/ui"
import { ApiError, authApi } from "../api"
import { checkPassword } from "../utils"

import logoImg from "@/imports/ChatGPT_Image_19_de_ago._de_2026__20_24_51.png"

export default function Register() {
  const { navigate, showToast, handleError } = useApp()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [registration, setRegistration] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ============================================================
     VALIDAÇÕES
  ============================================================ */

  const trimmedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()

  const nameParts = trimmedName.split(/\s+/).filter(Boolean)

  const isNameValid = trimmedName.length >= 3 && nameParts.length >= 2

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail)

  const trimmedRegistration = registration.trim()

  const passwordRequirements = checkPassword(password)

  const isPasswordValid =
    passwordRequirements.minLength &&
    passwordRequirements.maxLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword

  const formIsValid =
    isNameValid &&
    isEmailValid &&
    trimmedRegistration.length > 0 &&
    isPasswordValid &&
    passwordsMatch

  /* ============================================================
     FORÇA DA SENHA
  ============================================================ */

  const passwordScore = [
    passwordRequirements.minLength,
    passwordRequirements.uppercase,
    passwordRequirements.lowercase,
    passwordRequirements.number,
    passwordRequirements.special,
  ].filter(Boolean).length

  let passwordStrength = ""

  if (password.length > 0) {
    if (passwordScore <= 2) {
      passwordStrength = "Fraca"
    } else if (passwordScore <= 4) {
      passwordStrength = "Média"
    } else {
      passwordStrength = "Forte"
    }
  }

  /* ============================================================
     SUBMIT
  ============================================================ */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!trimmedName) {
      showToast("Informe seu nome completo.", "error")
      return
    }

    if (!isNameValid) {
      showToast(
        "Digite seu nome completo, incluindo nome e sobrenome.",
        "error",
      )
      return
    }

    if (!normalizedEmail) {
      showToast("Informe seu e-mail institucional.", "error")
      return
    }

    if (!isEmailValid) {
      showToast("Digite um e-mail institucional válido.", "error")
      return
    }

    if (!trimmedRegistration) {
      showToast("Informe sua matrícula.", "error")
      return
    }

    if (!isPasswordValid) {
      showToast("A senha não atende aos requisitos de segurança.", "error")
      return
    }

    if (!passwordsMatch) {
      showToast("As senhas não coincidem.", "error")
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await authApi.register({
        name: trimmedName,
        email: normalizedEmail,
        password,
        registration: trimmedRegistration,
      })

      showToast("Conta criada com sucesso!")

      navigate("login")
    } catch (error) {
      if (error instanceof ApiError && error.code === "ERR_USER_001") {
        setErrors({ registration: error.message })
      } else if (error instanceof ApiError && error.code === "ERR_USER_002") {
        setErrors({ email: error.message })
      } else if (error instanceof ApiError && error.status === 422) {
        setErrors(error.fields)
      } else {
        handleError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ============================================================
     REQUISITO DA SENHA
  ============================================================ */

  function PasswordRequirement({
    valid,
    children,
  }: {
    valid: boolean
    children: React.ReactNode
  }) {
    return (
      <div
        className={`flex items-center gap-2 text-xs ${
          valid ? "text-green-600" : "text-text-secondary"
        }`}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
            valid
              ? "bg-green-100 text-green-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {valid ? "✓" : "•"}
        </span>

        <span>{children}</span>
      </div>
    )
  }

  /* ============================================================
     ÍCONE DO OLHO
  ============================================================ */

  function EyeIcon({ hidden }: { hidden: boolean }) {
    if (hidden) {
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
            strokeLinecap="round"
          />

          <path
            d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
            strokeLinecap="round"
          />

          <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" strokeLinecap="round" />

          <path d="M1 1l22 22" strokeLinecap="round" />
        </svg>
      )
    }

    return (
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
    )
  }

  /* ============================================================
     TELA
  ============================================================ */

  return (
    <>
      {/* ========================================================
          ASTERISCO VERMELHO DOS CAMPOS OBRIGATÓRIOS
      ======================================================== */}

      <style>{`
        .required-field label::after {
          content: " *";
          color: #ef4444;
          font-weight: 700;
        }
      `}</style>

      <div className="min-h-screen w-full bg-bg flex flex-col lg:flex-row">
        {/* ======================================================
            LADO ESQUERDO
        ====================================================== */}

        <div
          className="
            relative
            flex
            w-full
            min-h-[300px]
            sm:min-h-[340px]
            lg:min-h-screen
            lg:w-1/2
            flex-col
            justify-between
            overflow-hidden
            p-6
            sm:p-8
            lg:p-12
          "
          style={{
            backgroundColor: "#1E4B5C",
          }}
        >
          {/* Círculos decorativos */}

          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              right: -240,
              bottom: -250,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.035)",
            }}
          />

          <div
            className="absolute pointer-events-none"
            style={{
              width: 350,
              height: 350,
              right: -180,
              bottom: -80,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />

          <div
            className="
              relative
              z-10
              flex
              min-h-[270px]
              sm:min-h-[310px]
              lg:min-h-full
              flex-col
              justify-between
            "
          >
            {/* LOGO */}

            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="Lab Manager"
                className="
                  rounded-xl
                  bg-white
                  p-1
                  object-contain
                "
                style={{
                  width: "clamp(58px, 8vw, 80px)",
                  height: "clamp(58px, 8vw, 80px)",
                }}
              />

              <span
                className="
                  text-white
                  tracking-wide
                  text-base
                  sm:text-lg
                "
                style={{
                  fontWeight: 800,
                }}
              >
                LAB MANAGER
              </span>
            </div>

            {/* TEXTO */}

            <div className="max-w-xl">
              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  font-800
                  text-white
                  leading-tight
                  mb-3
                  sm:mb-4
                "
              >
                Faça parte do
                <br />
                LAB MANAGER.
              </h2>

              <p
                className="
                  text-white/60
                  text-sm
                  sm:text-base
                  lg:text-lg
                  leading-relaxed
                  max-w-lg
                "
              >
                Crie sua conta e tenha acesso a uma experiência simples e
                organizada para gerenciar os laboratórios da sua instituição.
              </p>
            </div>

            {/* RODAPÉ */}

            <p className="text-white/25 text-[10px] sm:text-xs">
              © 2026 LAB MANAGER — Sistema de Gestão de Laboratórios
            </p>
          </div>
        </div>

        {/* ======================================================
            LADO DIREITO
        ====================================================== */}

        <div
          className="
            w-full
            lg:w-1/2
            flex-1
            flex
            items-center
            justify-center
            bg-bg
            p-4
            sm:p-6
            lg:p-8
          "
        >
          <div className="w-full max-w-md mx-auto">
            {/* CARD */}

            <div
              className="
                w-full
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-border
                p-5
                sm:p-6
                md:p-8
              "
            >
              {/* LOGO MOBILE */}

              <div
                className="
                  lg:hidden
                  flex
                  items-center
                  gap-3
                  mb-6
                "
              >
                <img
                  src={logoImg}
                  alt="Lab Manager"
                  className="
                    w-10
                    h-10
                    rounded-lg
                    object-contain
                  "
                />

                <span className="font-800 text-primary text-base">
                  LAB MANAGER
                </span>
              </div>

              {/* TÍTULO */}

              <div className="mb-6">
                <h1 className="text-2xl font-800 text-text">Criar conta</h1>

                <p className="text-text-secondary text-sm mt-1">
                  Preencha seus dados para criar sua conta
                </p>
              </div>

              {/* FORMULÁRIO */}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* =================================================
                    NOME
                ================================================== */}

                <div className="required-field">
                  <Input
                    label="Nome completo"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />

                  {name.length > 0 && !isNameValid && (
                    <p className="mt-1.5 text-xs text-red-500">
                      Digite seu nome completo, incluindo nome e sobrenome.
                    </p>
                  )}

                  {name.length > 0 && isNameValid && (
                    <p className="mt-1.5 text-xs text-green-600">
                      ✓ Nome válido
                    </p>
                  )}
                </div>

                {/* =================================================
                    E-MAIL
                ================================================== */}

                <div className="required-field">
                  <Input
                    label="E-mail institucional"
                    type="email"
                    placeholder="seu.nome@instituicao.edu.br"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors((prev) => ({ ...prev, email: "" }))
                    }}
                    autoComplete="email"
                    error={errors.email}
                  />

                  {email.length > 0 && !isEmailValid && (
                    <p className="mt-1.5 text-xs text-red-500">
                      Digite um e-mail válido.
                    </p>
                  )}

                  {email.length > 0 && isEmailValid && !errors.email && (
                    <p className="mt-1.5 text-xs text-green-600">
                      ✓ E-mail válido
                    </p>
                  )}
                </div>

                {/* =================================================
                    MATRÍCULA
                ================================================== */}

                <div className="required-field">
                  <Input
                    label="Matrícula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={registration}
                    onChange={(e) => {
                      setRegistration(e.target.value)
                      setErrors((prev) => ({ ...prev, registration: "" }))
                    }}
                    autoComplete="off"
                    error={errors.registration}
                  />
                </div>

                {/* =================================================
                    SENHA
                ================================================== */}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-600 text-text">
                    Senha
                    <span className="text-red-500 font-700"> *</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      maxLength={64}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="
                        w-full
                        px-3
                        py-2.5
                        text-sm
                        bg-white
                        border
                        border-border
                        rounded-lg
                        text-text
                        placeholder-text-secondary
                        pr-10
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary/30
                        focus:border-primary
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-text-secondary
                        hover:text-text
                      "
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>

                  {errors.password && (
                    <span className="text-xs text-danger">
                      {errors.password}
                    </span>
                  )}

                  {/* REQUISITOS */}

                  {password.length > 0 && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-600 text-text">
                          Requisitos da senha
                        </span>

                        <span
                          className={`text-xs font-600 ${
                            passwordStrength === "Forte"
                              ? "text-green-600"
                              : passwordStrength === "Média"
                                ? "text-yellow-600"
                                : "text-red-500"
                          }`}
                        >
                          {passwordStrength}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <PasswordRequirement
                          valid={passwordRequirements.minLength}
                        >
                          Mínimo de 8 caracteres
                        </PasswordRequirement>

                        <PasswordRequirement
                          valid={passwordRequirements.maxLength}
                        >
                          Máximo de 64 caracteres
                        </PasswordRequirement>

                        <PasswordRequirement
                          valid={passwordRequirements.uppercase}
                        >
                          Uma letra maiúscula
                        </PasswordRequirement>

                        <PasswordRequirement
                          valid={passwordRequirements.lowercase}
                        >
                          Uma letra minúscula
                        </PasswordRequirement>

                        <PasswordRequirement
                          valid={passwordRequirements.number}
                        >
                          Um número
                        </PasswordRequirement>

                        <PasswordRequirement
                          valid={passwordRequirements.special}
                        >
                          Um caractere especial
                        </PasswordRequirement>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    CONFIRMAR SENHA
                ================================================== */}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-600 text-text">
                    Confirmar senha
                    <span className="text-red-500 font-700"> *</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite novamente sua senha"
                      value={confirmPassword}
                      maxLength={64}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className={`
                        w-full
                        px-3
                        py-2.5
                        text-sm
                        bg-white
                        border
                        rounded-lg
                        text-text
                        placeholder-text-secondary
                        pr-10
                        focus:outline-none
                        focus:ring-2
                        ${
                          confirmPassword.length > 0
                            ? passwordsMatch
                              ? "border-green-500 focus:ring-green-500/20"
                              : "border-red-400 focus:ring-red-400/20"
                            : "border-border focus:ring-primary/30 focus:border-primary"
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-text-secondary
                        hover:text-text
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmação da senha"
                          : "Mostrar confirmação da senha"
                      }
                    >
                      <EyeIcon hidden={showConfirmPassword} />
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-xs ${
                        passwordsMatch ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch
                        ? "✓ As senhas coincidem"
                        : "✕ As senhas não coincidem"}
                    </p>
                  )}
                </div>

                {/* =================================================
                    BOTÃO
                ================================================== */}

                <Btn
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading || !formIsValid}
                  className="
                    w-full
                    justify-center
                    py-3
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </Btn>

                {/* =================================================
                    LOGIN
                ================================================== */}

                <div className="text-center pt-1">
                  <span className="text-sm text-text-secondary">
                    Já possui uma conta?{" "}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate("login")}
                    className="
                      text-sm
                      text-accent
                      hover:underline
                      font-600
                    "
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
