import { useState } from "react"
import { useApp } from "../context"
import { Btn, Input } from "../components/ui"
import { ApiError, authApi } from "../api"
import AuthCard from "../components/AuthCard"
import { checkPassword } from "../utils"

const REQUIREMENTS = [
  ["minLength", "Mínimo de 8 caracteres"],
  ["maxLength", "Máximo de 64 caracteres"],
  ["uppercase", "Uma letra maiúscula"],
  ["lowercase", "Uma letra minúscula"],
  ["number", "Um número"],
  ["special", "Um caractere especial"],
] as const

export default function ResetPassword() {
  const { pageParams, logout, showToast, handleError } = useApp()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const token = pageParams.token ?? ""
  const requirements = checkPassword(password)
  const isPasswordValid = Object.values(requirements).every(Boolean)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  function goToLogin() {
    window.history.replaceState(null, "", "/")
    logout()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authApi.resetPassword(token, password)
      goToLogin()
      showToast("Senha alterada. Entre com a nova senha.")
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message)
      } else if (err instanceof ApiError && err.status === 422) {
        setError(Object.values(err.fields)[0] ?? err.message)
      } else {
        handleError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Link inválido">
        <p className="text-sm text-text-secondary mb-6">
          Este link de redefinição não é válido. Peça um novo na tela de login.
        </p>

        <Btn
          variant="secondary"
          className="w-full justify-center py-3"
          onClick={goToLogin}
        >
          Voltar ao login
        </Btn>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Redefinir senha" subtitle="Escolha sua nova senha">
      {error && (
        <div
          className="mb-6 p-4 rounded-xl border text-sm font-500"
          style={{
            backgroundColor: "#FEF2F2",
            borderColor: "#FCA5A5",
            color: "#991B1B",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nova senha"
          type="password"
          value={password}
          maxLength={64}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {password.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {REQUIREMENTS.map(([key, label]) => (
              <span
                key={key}
                className={`text-xs ${
                  requirements[key] ? "text-green-600" : "text-text-secondary"
                }`}
              >
                {requirements[key] ? "✓" : "•"} {label}
              </span>
            ))}
          </div>
        )}

        <Input
          label="Confirmar nova senha"
          type="password"
          value={confirmPassword}
          maxLength={64}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          error={
            confirmPassword.length > 0 && !passwordsMatch
              ? "As senhas não coincidem."
              : undefined
          }
        />

        <Btn
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!isPasswordValid || !passwordsMatch}
          className="w-full justify-center py-3"
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </Btn>

        <div className="text-center">
          <button
            type="button"
            onClick={goToLogin}
            className="text-sm text-accent hover:underline font-600"
          >
            Voltar ao login
          </button>
        </div>
      </form>
    </AuthCard>
  )
}
