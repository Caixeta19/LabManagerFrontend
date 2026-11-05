import { useState } from 'react';
import { useApp } from '../context';
import { ReservationBadge, Btn, EmptyState, Modal } from '../components/ui';
import { formatDate, getLabById } from '../data';
import type { ReservationStatus } from '../types';

type Filter = 'all' | 'upcoming' | 'confirmed' | 'pending' | 'history';

// Simple QR Code SVG
function QRCodeSVG() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
    [0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,1,1,0,0,0],
    [1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0],
    [0,0,1,1,0,0,0,1,0,1,1,0,0,1,0,0,0,1,1,0,1],
    [1,1,0,0,1,1,1,0,1,0,1,1,0,0,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,1,0,1,0,0,0],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,1,1,0,1,1],
    [1,0,1,1,1,0,1,0,0,0,0,1,0,1,1,0,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,1,0,1,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,0,0,1,0,1,1,0,1,0,0,1],
  ];
  const size = 21;
  const cell = 12;
  return (
    <svg width={size * cell} height={size * cell} viewBox={`0 0 ${size * cell} ${size * cell}`}>
      {cells.map((row, r) =>
        row.map((v, c) =>
          v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1E4B5C" /> : null
        )
      )}
    </svg>
  );
}

export default function MyReservations() {
  const { state, currentUser, navigate, cancelReservation, showToast } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [qrReservation, setQrReservation] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const userReservations = state.reservations.filter(r => r.userId === currentUser?.id);

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = userReservations.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return (r.status === 'confirmed' || r.status === 'pending') && r.date >= todayStr;
    if (filter === 'confirmed') return r.status === 'confirmed';
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'history') return r.status === 'cancelled' || r.status === 'expired' || r.date < todayStr;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'upcoming', label: 'Próximas' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'history', label: 'Histórico' },
  ];

  function confirmCancel() {
    if (!cancelTarget) return;
    cancelReservation(cancelTarget);
    setCancelTarget(null);
    showToast('Reserva cancelada.', 'info');
  }

  const qrData = state.reservations.find(r => r.id === qrReservation);
  const qrLab = qrData ? getLabById(state.labs, qrData.labId) : null;

  return (
    <div className="p-8">
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-600 transition-colors ${
              filter === f.key ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:text-text hover:border-primary/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma reserva encontrada"
            description="Não há reservas para o filtro selecionado."
            action={<Btn onClick={() => navigate('new-reservation')}>Nova reserva</Btn>}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Laboratório</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Horário</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => {
                const lab = getLabById(state.labs, r.labId);
                return (
                  <tr key={r.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-text">{lab?.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{r.startTime}–{r.endTime}</td>
                    <td className="px-6 py-4"><ReservationBadge status={r.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => navigate('reservation-detail', { id: r.id })}>
                          Detalhes
                        </Btn>
                        {r.status === 'confirmed' && (
                          <Btn variant="secondary" size="sm" onClick={() => setQrReservation(r.id)}>
                            QR Code
                          </Btn>
                        )}
                        {(r.status === 'confirmed' || r.status === 'pending') && (
                          <Btn variant="danger" size="sm" onClick={() => setCancelTarget(r.id)}>
                            Cancelar
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* QR Code Modal */}
      <Modal open={!!qrReservation} onClose={() => setQrReservation(null)} title="QR Code da reserva" size="sm">
        {qrData && (
          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-1 mb-4 text-sm">
              <span className="font-700 text-text text-base">{qrLab?.name}</span>
              <span className="text-text-secondary">{formatDate(qrData.date)} · {qrData.startTime}–{qrData.endTime}</span>
              <ReservationBadge status="confirmed" />
            </div>
            <div className="flex justify-center p-4 bg-bg rounded-xl mb-4">
              <QRCodeSVG />
            </div>
            <p className="text-xs text-text-secondary">
              Apresente este código na entrada do laboratório. Válido apenas dentro do horário reservado.
            </p>
            <Btn variant="secondary" className="w-full justify-center mt-4" onClick={() => setQrReservation(null)}>
              Fechar
            </Btn>
          </div>
        )}
      </Modal>

      {/* Cancel Confirm Modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar reserva" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary mb-6">Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setCancelTarget(null)}>Voltar</Btn>
            <Btn variant="danger" className="flex-1 justify-center" onClick={confirmCancel}>Confirmar cancelamento</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Reservation Detail ───────────────────────────────────────────────────────

export function ReservationDetail() {
  const { state, pageParams, navigate } = useApp();
  const [showQR, setShowQR] = useState(false);
  const r = state.reservations.find(x => x.id === pageParams.id);
  if (!r) return <div className="p-8 text-text-secondary">Reserva não encontrada.</div>;

  const lab = getLabById(state.labs, r.labId);
  const user = state.users.find(u => u.id === r.userId);

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => navigate('my-reservations')} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text mb-6 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M15 18l-6-6 6-6" /></svg>
        Voltar às reservas
      </button>

      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-700 text-text">{lab?.name}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{lab?.location}</p>
          </div>
          <ReservationBadge status={r.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {[
            { label: 'Data', value: formatDate(r.date) },
            { label: 'Horário', value: `${r.startTime} – ${r.endTime}` },
            { label: 'Solicitante', value: user?.name },
            { label: 'E-mail', value: user?.email },
            { label: 'Data da solicitação', value: r.createdAt },
            { label: 'Capacidade do lab', value: `${lab?.capacity} pessoas` },
          ].map(({ label, value }) => (
            <div key={label} className="py-3 border-b border-border">
              <div className="text-xs text-text-secondary font-500 mb-1">{label}</div>
              <div className="text-sm font-600 text-text">{value}</div>
            </div>
          ))}
        </div>

        {r.status === 'confirmed' && (
          <div className="pt-2">
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4">
              <p className="text-sm font-600 text-success">Reserva confirmada! Você pode acessar o laboratório no horário agendado.</p>
            </div>
            <Btn className="w-full justify-center" onClick={() => setShowQR(true)}>Ver QR Code</Btn>
          </div>
        )}
      </div>

      <Modal open={showQR} onClose={() => setShowQR(false)} title="QR Code da reserva" size="sm">
        <div className="text-center">
          <div className="flex justify-center p-4 bg-bg rounded-xl mb-4">
            <QRCodeSVG />
          </div>
          <p className="text-xs text-text-secondary">Apresente este código na entrada do laboratório. Válido apenas dentro do horário reservado.</p>
          <Btn variant="secondary" className="w-full justify-center mt-4" onClick={() => setShowQR(false)}>Fechar</Btn>
        </div>
      </Modal>
    </div>
  );
}

