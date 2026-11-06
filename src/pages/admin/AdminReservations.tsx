import { useState } from 'react';
import { useApp } from '../../context';
import { ReservationBadge, Btn, EmptyState } from '../../components/ui';
import { formatDate, getLabById, getUserById } from '../../utils';

export default function AdminReservations() {
  const { state, navigate } = useApp();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLab, setFilterLab] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');

  let reservations = [...state.reservations];
  if (filterStatus) reservations = reservations.filter(r => r.status === filterStatus);
  if (filterLab) reservations = reservations.filter(r => r.labId === filterLab);
  if (filterDate) reservations = reservations.filter(r => r.date === filterDate);
  if (filterUser) reservations = reservations.filter(r => r.userId === filterUser);

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Status', value: filterStatus, onChange: setFilterStatus,
              options: [['', 'Todos'], ['pending', 'Pendente'], ['confirmed', 'Confirmada'], ['cancelled', 'Cancelada'], ['expired', 'Expirada']],
            },
            {
              label: 'Laboratório', value: filterLab, onChange: setFilterLab,
              options: [['', 'Todos'], ...state.labs.map(l => [l.id, l.name])],
            },
            {
              label: 'Usuário', value: filterUser, onChange: setFilterUser,
              options: [['', 'Todos'], ...state.users.map(u => [u.id, u.name])],
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">{label}</label>
              <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">Data</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        {(filterStatus || filterLab || filterDate || filterUser) && (
          <button onClick={() => { setFilterStatus(''); setFilterLab(''); setFilterDate(''); setFilterUser(''); }}
            className="mt-3 text-xs text-accent hover:underline font-500">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {reservations.length === 0 ? (
          <EmptyState title="Nenhuma reserva encontrada" description="Tente ajustar os filtros." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Laboratório</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Horário</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map(r => {
                const lab = getLabById(state.labs, r.labId);
                const user = getUserById(state.users, r.userId);
                return (
                  <tr key={r.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent/15 text-accent font-700 text-xs flex items-center justify-center flex-shrink-0">{user?.initials}</div>
                        <div>
                          <div className="text-sm font-500 text-text">{user?.name}</div>
                          <div className="text-xs text-text-secondary capitalize">{({ student: 'Aluno', professor: 'Professor', admin: 'Admin' } as Record<string, string>)[user?.role ?? ''] ?? user?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lab?.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{r.startTime}–{r.endTime}</td>
                    <td className="px-6 py-4"><ReservationBadge status={r.status} /></td>
                    <td className="px-6 py-4">
                      <Btn variant="ghost" size="sm" onClick={() => navigate('reservation-detail', { id: r.id })}>Ver</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
