import React from 'react';
import type { ReservationStatus, LoanStatus } from '../types';

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const reservationBadgeConfig: Record<ReservationStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendente', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmada', bg: '#D1FAE5', text: '#065F46' },
  cancelled: { label: 'Cancelada', bg: '#FEE2E2', text: '#991B1B' },
  expired: { label: 'Expirada', bg: '#F1F5F9', text: '#64748B' },
};

const loanBadgeConfig: Record<LoanStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Ativo', bg: '#D1FAE5', text: '#065F46' },
  overdue: { label: 'Atrasado', bg: '#FEE2E2', text: '#991B1B' },
  returned: { label: 'Devolvido', bg: '#F1F5F9', text: '#64748B' },
};

const equipmentBadgeConfig: Record<string, { label: string; bg: string; text: string }> = {
  available: { label: 'Disponível', bg: '#D1FAE5', text: '#065F46' },
  in_use: { label: 'Em uso', bg: '#DBEAFE', text: '#1E40AF' },
  maintenance: { label: 'Manutenção', bg: '#EDE9FE', text: '#5B21B6' },
};

const userRoleConfig: Record<string, { label: string; bg: string; text: string }> = {
  student: { label: 'Aluno', bg: '#DBEAFE', text: '#1E40AF' },
  professor: { label: 'Professor', bg: '#EDE9FE', text: '#5B21B6' },
  admin: { label: 'Admin', bg: '#FEF3C7', text: '#92400E' },
};

const userStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Ativo', bg: '#D1FAE5', text: '#065F46' },
  inactive: { label: 'Inativo', bg: '#F1F5F9', text: '#64748B' },
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  const cfg = reservationBadgeConfig[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

export function LoanBadge({ status }: { status: LoanStatus }) {
  const cfg = loanBadgeConfig[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

export function EquipmentBadge({ status }: { status: string }) {
  const cfg = equipmentBadgeConfig[status] ?? { label: status, bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const cfg = userRoleConfig[role] ?? { label: role, bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: string }) {
  const cfg = userStatusConfig[status] ?? { label: status, bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export function Btn({ variant = 'primary', size = 'md', loading, children, className = '', ...rest }: BtnProps) {
  const base = 'inline-flex items-center justify-center font-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-sm gap-1.5', md: 'px-4 py-2 text-sm gap-2' };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-white text-primary border border-border hover:bg-bg focus:ring-primary',
    danger: 'bg-danger text-white hover:opacity-90 focus:ring-danger',
    ghost: 'text-text-secondary hover:bg-border focus:ring-border',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-600 text-text">{label}</label>}
      <input
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-text placeholder-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-600 text-text">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-700 text-text">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-text-secondary transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

import type { ToastMessage } from '../types';

export function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-500 max-w-sm animate-fade-in"
          style={{
            backgroundColor: t.type === 'success' ? '#2E9E5B' : t.type === 'error' ? '#C4433A' : '#1E4B5C',
            color: '#fff',
          }}
        >
          {t.type === 'success' && <CheckIcon />}
          {t.type === 'error' && <XIcon />}
          {t.type === 'info' && <InfoIcon />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-base font-700 text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Loading / Error State ────────────────────────────────────────────────────

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <svg className="animate-spin h-8 w-8 text-accent mb-3" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {onRetry && <Btn variant="secondary" onClick={onRetry}>Tentar novamente</Btn>}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full bg-accent/15 text-accent font-700 flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

export function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

export function AlertBanner({ message, type = 'error' }: { message: string; type?: 'error' | 'warning' }) {
  const cfg = type === 'error'
    ? { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', iconColor: '#DC2626' }
    : { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', iconColor: '#D97706' };
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke={cfg.iconColor} strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span className="text-sm font-500" style={{ color: cfg.text }}>{message}</span>
    </div>
  );
}
