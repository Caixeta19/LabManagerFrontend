import { useState } from "react"
import { useApp } from "../context"
import { Btn, Input } from "../components/ui"
import { authApi } from "../api"
import AuthCard from "../components/AuthCard"

export default function ForgotPassword() {
  const { navigate, handleError } = useApp()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Digite um e-mail válido.")
      return
    }

    setError("")
    setLoading(true)

    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Verifique seu e-mail">
        <p className="text-sm text-text-secondary mb-6">
          Se o e-mail existir, enviamos um link para redefinir sua senha. Ele
          vale por 30 minutos.
        </p>

        <Btn
          variant="secondary"
          className="w-full justify-center py-3"
          onClick={() => navigate("login")}
        >
          Voltar ao login
        </Btn>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail para receber o link de redefinição"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="E-mail institucional"
          type="email"
          placeholder="seu.nome@instituicao.edu.br"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError("")
          }}
          error={error}
          autoComplete="email"
        />

        <Btn
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full justify-center py-3"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </Btn>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("login")}
            className="text-sm text-accent hover:underline font-600"
          >
            Voltar ao login
          </button>
        </div>
      </form>
    </AuthCard>
  )
}
