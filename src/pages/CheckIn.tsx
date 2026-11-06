import { useEffect, useRef, useState } from "react"
import type { Html5Qrcode } from "html5-qrcode"
import { useApp } from "../context"
import { AlertBanner, Btn, Input } from "../components/ui"
import { ApiError, checkinApi } from "../api"

const SCANNER_ID = "checkin-scanner"

const ERROR_MESSAGES: Record<string, string> = {
  ERR_CHECKIN_001: "Sua reserva ainda não foi confirmada. Verifique seu e-mail.",
  ERR_CHECKIN_002: "QR Code inválido ou fora do horário permitido.",
  ERR_CHECKIN_003: "Check-in já realizado para esta reserva.",
}

export default function CheckIn() {
  const { handleError } = useApp()

  const [code, setCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processingRef = useRef(false)

  async function stopScanner() {
    const scanner = scannerRef.current
    scannerRef.current = null
    setScanning(false)

    if (scanner?.isScanning) {
      await scanner.stop().catch(() => undefined)
    }
  }

  // Desliga a câmera ao sair da tela
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      if (scanner?.isScanning) scanner.stop().catch(() => undefined)
    }
  }, [])

  async function submit(value: string) {
    const codigo = value.trim()
    if (!codigo || processingRef.current) return

    processingRef.current = true
    setProcessing(true)
    setError("")
    setSuccess(false)

    try {
      await checkinApi.checkIn(codigo)
      setSuccess(true)
      setCode("")
    } catch (err) {
      if (err instanceof ApiError && ERROR_MESSAGES[err.code]) {
        setError(ERROR_MESSAGES[err.code])
      } else {
        handleError(err)
      }
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }

  async function startScanner() {
    setError("")
    setSuccess(false)
    setScanning(true)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        (decodedText) => {
          stopScanner()
          submit(decodedText)
        },
        () => undefined,
      )
    } catch {
      scannerRef.current = null
      setScanning(false)
      setError(
        "Não foi possível abrir a câmera. Verifique a permissão do navegador ou digite o código.",
      )
    }
  }

  return (
    <div className="p-8 max-w-xl space-y-6">
      {success && (
        <div
          className="p-4 rounded-xl border text-sm font-600"
          style={{
            backgroundColor: "#D1FAE5",
            borderColor: "#6EE7B7",
            color: "#065F46",
          }}
        >
          Check-in realizado com sucesso!
        </div>
      )}

      {error && <AlertBanner type="error" message={error} />}

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-base font-700 text-text mb-1">Ler QR Code</h2>

        <p className="text-sm text-text-secondary mb-5">
          Aponte a câmera para o QR Code da sua reserva, dentro do horário
          reservado.
        </p>

        <div
          id={SCANNER_ID}
          className={scanning ? "rounded-xl overflow-hidden mb-4" : "hidden"}
        />

        {scanning ? (
          <Btn
            variant="secondary"
            className="w-full justify-center"
            onClick={stopScanner}
          >
            Fechar câmera
          </Btn>
        ) : (
          <Btn className="w-full justify-center" onClick={startScanner}>
            Abrir câmera
          </Btn>
        )}
      </div>

      <form
        className="bg-white rounded-2xl border border-border p-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit(code)
        }}
      >
        <h2 className="text-base font-700 text-text">Digitar código</h2>

        <Input
          label="Código do QR Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código lido do QR Code"
          autoComplete="off"
        />

        <Btn
          type="submit"
          className="w-full justify-center"
          loading={processing}
          disabled={!code.trim()}
        >
          Fazer check-in
        </Btn>
      </form>
    </div>
  )
}
