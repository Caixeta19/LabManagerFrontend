import { useApp } from '../context';
import { Avatar } from './ui';
import logoImg from '@/imports/ChatGPT_Image_19_de_ago._de_2026__20_24_51.png';
import type { Page } from '../types';

interface NavItem {
  label: string;
  page: Page;
  icon: React.ReactNode;
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{children}</span>;
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const LabIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M19 21H5a2 2 0 01-2-2V7l7-4 7 4v12a2 2 0 01-2 2z" /><path strokeLinecap="round" d="M9 21V12h6v9" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 8v8M8 12h8" />
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const ToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);
const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export default function Sidebar() {
  const { currentUser, page, navigate, logout } = useApp();
  if (!currentUser) return null;

  const role = currentUser.role;

  const general: NavItem[] = [
    { label: 'Dashboard', page: 'dashboard', icon: <HomeIcon /> },
    { label: 'Laboratórios', page: 'labs', icon: <LabIcon /> },
    { label: 'Nova reserva', page: 'new-reservation', icon: <PlusIcon /> },
    { label: 'Minhas reservas', page: 'my-reservations', icon: <CalendarIcon /> },
    { label: 'Equipamentos disponíveis', page: 'equipment', icon: <ToolIcon /> },
    { label: 'Meus empréstimos', page: 'my-loans', icon: <PackageIcon /> },
  ];

  const professorItems: NavItem[] = [
    { label: 'Todas as reservas', page: 'all-reservations', icon: <ListIcon /> },
  ];

  const adminItems: NavItem[] = [
    { label: 'Usuários', page: 'admin-users', icon: <UsersIcon /> },
    { label: 'Laboratórios', page: 'admin-labs', icon: <LabIcon /> },
    { label: 'Equipamentos', page: 'admin-equipment', icon: <ToolIcon /> },
    { label: 'Reservas', page: 'admin-reservations', icon: <CalendarIcon /> },
    { label: 'Empréstimos', page: 'admin-loans', icon: <PackageIcon /> },
  ];

  function NavLink({ item }: { item: NavItem }) {
    const active = page === item.page;
    return (
      <button
        onClick={() => navigate(item.page)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-colors text-left ${
          active
            ? 'bg-white/15 text-white font-600'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        <span className={active ? 'text-accent' : 'text-white/50'}>{item.icon}</span>
        <span className="truncate">{item.label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
      </button>
    );
  }

  function SectionLabel({ children }: { children: string }) {
    return (
      <div className="px-3 py-2 text-[10px] font-700 uppercase tracking-widest text-white/35 mt-2">
        {children}
      </div>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col" style={{ backgroundColor: '#1E4B5C' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Lab Manager" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5" />
          <div>
            <div className="text-white font-800 text-sm leading-tight tracking-wide">LAB MANAGER</div>
            <div className="text-white/40 text-xs font-500">Sistema de Laboratórios</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SectionLabel>Geral</SectionLabel>
        {general.map(item => <NavLink key={item.page} item={item} />)}

        {(role === 'professor') && (
          <>
            <SectionLabel>Professor</SectionLabel>
            {professorItems.map(item => <NavLink key={item.page} item={item} />)}
          </>
        )}

        {role === 'admin' && (
          <>
            <SectionLabel>Professor</SectionLabel>
            {professorItems.map(item => <NavLink key={item.page} item={item} />)}
            <SectionLabel>Gestão</SectionLabel>
            {adminItems.map(item => <NavLink key={item.page} item={item} />)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Avatar initials={currentUser.initials} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-600 truncate">{currentUser.name}</div>
            <div className="text-white/50 text-xs truncate capitalize">{
              { student: 'Aluno', professor: 'Professor', admin: 'Administrador' }[currentUser.role]
            }</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm font-500 transition-colors"
        >
          <LogoutIcon />
          Sair
        </button>
      </div>
    </aside>
  );
}
