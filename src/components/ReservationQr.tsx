import { useEffect, useState } from "react"
import { reservationsApi } from "../api"
import { ErrorState, LoadingState } from "./ui"

/** QR Code real da reserva, buscado como blob porque a rota exige o token. */
export default function ReservationQr({
  reservationId,
}: {
  reservationId: string
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    setImageUrl(null)
    setFailed(false)

    reservationsApi
      .qrCode(reservationId)
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
  }, [reservationId, attempt])

  if (failed) {
    return (
      <ErrorState
        message="Não foi possível carregar o QR Code."
        onRetry={() => setAttempt((n) => n + 1)}
      />
    )
  }

  if (!imageUrl) {
    return <LoadingState label="Gerando QR Code..." />
  }

  return (
    <>
      <div className="flex justify-center p-4 bg-bg rounded-xl mb-4">
        <img
          src={imageUrl}
          alt="QR Code da reserva"
          width={250}
          height={250}
        />
      </div>

      <a
        href={imageUrl}
        download={`reserva-${reservationId}.png`}
        className="inline-flex w-full items-center justify-center px-4 py-2 mb-3 text-sm font-600 rounded-lg bg-white text-primary border border-border hover:bg-bg transition-colors"
      >
        Baixar QR Code
      </a>
    </>
  )
}
