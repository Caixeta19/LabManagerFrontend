import { useState } from 'react';
import { useApp } from '../context';
import { ReservationBadge, Btn, EmptyState } from '../components/ui';
import { formatDate, getLabById, getUserById } from '../data';

export default function AllReservations() {
  const { state, navigate } = useApp();
  const [filterLab, setFilterLab] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const studentIds = state.users.filter(u => u.role === 'student').map(u => u.id);

  let reservations = state.reservations.filter(r => studentIds.includes(r.userId));

  if (filterLab) reservations = reservations.filter(r => r.labId === filterLab);
  if (filterStatus) reservations = reservations.filter(r => r.status === filterStatus);
  if (filterDate) reservations = reservations.filter(r => r.date === filterDate);
  if (filterUser) reservations = reservations.filter(r => r.userId === filterUser);

  const students = state.users.filter(u => u.role === 'student');

  return (
    <div className="p-8 space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">Laboratório</label>
            <select
              value={filterLab}
              onChange={e => setFilterLab(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">Todos</option>
              {state.labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
              <option value="expired">Expirada</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">Data</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-600 text-text-secondary uppercase tracking-wide block mb-1.5">Aluno</label>
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">Todos</option>
              {students.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        {(filterLab || filterStatus || filterDate || filterUser) && (
          <button
            onClick={() => { setFilterLab(''); setFilterStatus(''); setFilterDate(''); setFilterUser(''); }}
            className="mt-3 text-xs text-accent hover:underline font-500"
          >
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
                <th className="px-6 py-3">Aluno</th>
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
                        <div className="w-7 h-7 rounded-full bg-accent/15 text-accent font-700 text-xs flex items-center justify-center flex-shrink-0">
                          {user?.initials}
                        </div>
                        <div className="text-sm font-500 text-text">{user?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lab?.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{r.startTime}–{r.endTime}</td>
                    <td className="px-6 py-4"><ReservationBadge status={r.status} /></td>
                    <td className="px-6 py-4">
                      <Btn variant="ghost" size="sm" onClick={() => navigate('reservation-detail', { id: r.id })}>
                        Ver
                      </Btn>
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
