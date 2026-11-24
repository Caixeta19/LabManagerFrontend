import { useEffect, useState } from "react"
import { labsApi } from "../api"
import { useApp } from "../context"
import type { Lab } from "../types"
import { Btn, ErrorState, LoadingState } from "./ui"

/** QR fixo de check-in do laboratório (ADMIN): ver, imprimir, baixar e gerar um novo. */
export default function LabCheckinQr({ lab }: { lab: Lab }) {
  const { showToast, handleError } = useApp()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [version, setVersion] = useState(0)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    setImageUrl(null)
    setFailed(false)

    labsApi
      .checkinQrCode(lab.id)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [lab.id, version])

  function print() {
    if (!imageUrl) return
    const w = window.open("", "_blank", "width=600,height=750")
    if (!w) {
      showToast("O navegador bloqueou a janela de impressão. Use \"Baixar\".", "error")
      return
    }
    const doc = w.document
    doc.title = `Check-in — ${lab.name}`
    doc.body.style.cssText = "font-family:sans-serif;text-align:center;padding:32px;margin:0"
    const h1 = doc.createElement("h1")
    h1.textContent = lab.name
    h1.style.cssText = "font-size:28px;margin:0 0 4px"
    const local = doc.createElement("p")
    local.textContent = lab.location
    local.style.cssText = "margin:0 0 24px;color:#555"
    const img = doc.createElement("img")
    img.src = imageUrl
    img.style.cssText = "width:320px;height:320px"
    const hint = doc.createElement("p")
    hint.textContent = "Check-in: abra o LabManager, entre em Check-in e leia este QR Code."
    hint.style.cssText = "margin-top:24px;font-size:16px"
    doc.body.append(h1, local, img, hint)
    img.onload = () => {
      w.focus()
      w.print()
    }
  }

  async function regenerate() {
    setRegenerating(true)
    try {
      await labsApi.regenerateCheckinToken(lab.id)
      showToast("Novo QR gerado. Imprima e substitua o da porta.")
      setConfirmRegen(false)
      setVersion((v) => v + 1)
    } catch (error) {
      handleError(error)
    } finally {
      setRegenerating(false)
    }
  }

  if (failed) {
    return (
      <ErrorState
        message="Não foi possível carregar o QR Code do laboratório."
        onRetry={() => setVersion((v) => v + 1)}
      />
    )
  }

  if (!imageUrl) {
    return <LoadingState label="Gerando QR Code..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center p-4 bg-bg rounded-xl">
        <img src={imageUrl} alt={`QR Code de check-in do ${lab.name}`} width={250} height={250} />
      </div>

      <p className="text-xs text-text-secondary text-center">
        Imprima e cole na porta do laboratório. Quem tiver reserva confirmada lê este QR na tela de
        Check-in, de 15 minutos antes do início até o fim da reserva.
      </p>

      <div className="flex gap-3">
        <Btn className="flex-1 justify-center" onClick={print}>Imprimir</Btn>
        <a
          href={imageUrl}
          download={`checkin-${lab.name.replace(/\s+/g, "-").toLowerCase()}.png`}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-600 rounded-lg bg-white text-primary border border-border hover:bg-bg transition-colors"
        >
          Baixar
        </a>
      </div>

      {confirmRegen ? (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 space-y-3">
          <p className="text-sm text-text">
            O QR impresso hoje deixa de funcionar. Será preciso imprimir e colar o novo. Continuar?
          </p>
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setConfirmRegen(false)}>
              Cancelar
            </Btn>
            <Btn variant="danger" className="flex-1 justify-center" loading={regenerating} onClick={regenerate}>
              Gerar novo QR
            </Btn>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full text-xs text-text-secondary hover:text-danger transition-colors"
          onClick={() => setConfirmRegen(true)}
        >
          QR vazou ou foi copiado? Gerar um novo
        </button>
      )}
    </div>
  )
}
