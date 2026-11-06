import { useApp } from '../context';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral das suas reservas e empréstimos' },
  labs: { title: 'Laboratórios', subtitle: 'Consulte os laboratórios disponíveis' },
  'lab-detail': { title: 'Detalhes do laboratório', subtitle: 'Informações completas e disponibilidade' },
  'new-reservation': { title: 'Nova reserva', subtitle: 'Reserve um laboratório' },
  'my-reservations': { title: 'Minhas reservas', subtitle: 'Gerencie suas reservas' },
  'reservation-detail': { title: 'Detalhes da reserva', subtitle: 'Informações da reserva' },
  'qr-code': { title: 'QR Code da reserva', subtitle: 'Apresente na entrada do laboratório' },
  'check-in': { title: 'Check-in', subtitle: 'Registre sua chegada ao laboratório' },
  equipment: { title: 'Equipamentos disponíveis', subtitle: 'Solicite empréstimo de equipamentos' },
  'my-loans': { title: 'Meus empréstimos', subtitle: 'Acompanhe seus empréstimos de equipamentos' },
  'all-reservations': { title: 'Todas as reservas', subtitle: 'Visão global de reservas de alunos' },
  'admin-users': { title: 'Usuários', subtitle: 'Gerencie usuários do sistema' },
  'admin-labs': { title: 'Laboratórios', subtitle: 'Gerencie os laboratórios da instituição' },
  'admin-equipment': { title: 'Equipamentos', subtitle: 'Gerencie o inventário de equipamentos' },
  'admin-reservations': { title: 'Reservas', subtitle: 'Visão global de todas as reservas' },
  'admin-loans': { title: 'Empréstimos', subtitle: 'Controle de empréstimos e devoluções' },
};

export default function Header() {
  const { page, currentUser } = useApp();
  const info = pageTitles[page] ?? { title: 'LAB MANAGER', subtitle: '' };

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white border-b border-border px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-700 text-text leading-tight">{info.title}</h1>
        {info.subtitle && <p className="text-sm text-text-secondary mt-0.5">{info.subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-text-secondary capitalize">{today}</div>
          {currentUser && (
            <div className="text-xs font-600 text-text">
              {{ student: 'Aluno', professor: 'Professor', admin: 'Administrador' }[currentUser.role]}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
