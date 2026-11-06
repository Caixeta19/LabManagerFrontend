import logoImg from "@/imports/ChatGPT_Image_19_de_ago._de_2026__20_24_51.png"

/** Cartão centralizado das telas de recuperação de senha. */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-3 mb-8">
            <img
              src={logoImg}
              alt="Lab Manager"
              className="w-9 h-9 object-contain"
            />

            <span className="font-800 text-primary text-base">LAB MANAGER</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-800 text-text">{title}</h1>

            {subtitle && (
              <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
