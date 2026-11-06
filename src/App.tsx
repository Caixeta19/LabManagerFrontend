import { AppProvider, useApp } from "./context"
import { ErrorState, LoadingState, ToastContainer } from "./components/ui"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import Login from "./pages/Login"
import Register from "./pages/Register"

import Dashboard from "./pages/Dashboard"
import Labs, { LabDetail } from "./pages/Labs"
import NewReservation from "./pages/NewReservation"
import MyReservations, { ReservationDetail } from "./pages/MyReservations"

import Equipment from "./pages/Equipment"
import MyLoans from "./pages/MyLoans"
import AllReservations from "./pages/AllReservations"

import AdminUsers from "./pages/admin/AdminUsers"
import AdminLabs from "./pages/admin/AdminLabs"
import AdminEquipment from "./pages/admin/AdminEquipment"
import AdminReservations from "./pages/admin/AdminReservations"
import AdminLoans from "./pages/admin/AdminLoans"

function PageContent() {
  const { page } = useApp()

  switch (page) {
    case "dashboard":
      return <Dashboard />

    case "labs":
      return <Labs />

    case "lab-detail":
      return <LabDetail />

    case "new-reservation":
      return <NewReservation />

    case "my-reservations":
      return <MyReservations />

    case "reservation-detail":
      return <ReservationDetail />

    case "equipment":
      return <Equipment />

    case "my-loans":
      return <MyLoans />

    case "all-reservations":
      return <AllReservations />

    case "admin-users":
      return <AdminUsers />

    case "admin-labs":
      return <AdminLabs />

    case "admin-equipment":
      return <AdminEquipment />

    case "admin-reservations":
      return <AdminReservations />

    case "admin-loans":
      return <AdminLoans />

    default:
      return <Dashboard />
  }
}

function AppShell() {
  const { page, currentUser, toasts, booting, dataStatus, reload } = useApp()

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingState label="Restaurando sua sessão..." />
      </div>
    )
  }

  /*
   * Login e Cadastro ficam fora do sistema
   * principal enquanto não existe usuário logado.
   */
  if (!currentUser) {
    return (
      <>
        {page === "register" ? <Register /> : <Login />}

        <ToastContainer toasts={toasts} />
      </>
    )
  }

  /*
   * Sistema principal
   */
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {dataStatus === "loading" && <LoadingState />}

          {dataStatus === "error" && (
            <ErrorState
              message="Não foi possível carregar os dados do sistema."
              onRetry={() => reload()}
            />
          )}

          {dataStatus === "ready" && <PageContent />}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
