import { useState } from 'react';
import { useApp } from '../../context';
import { LoanBadge, Btn, Modal, EmptyState } from '../../components/ui';
import { formatDate, getEquipmentById, getUserById } from '../../utils';

export default function AdminLoans() {
  const { state, returnLoan, showToast, handleError } = useApp();
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const targetLoan = state.loans.find(l => l.id === returnTarget);
  const targetEq = targetLoan ? getEquipmentById(state.equipment, targetLoan.equipmentId) : null;
  const targetUser = targetLoan ? getUserById(state.users, targetLoan.userId) : null;

  async function handleReturn() {
    if (!returnTarget) return;
    setProcessing(true);
    try {
      await returnLoan(returnTarget);
      setReturnTarget(null);
      showToast('Devolução registrada com sucesso.');
    } catch (error) {
      handleError(error);
    } finally {
      setProcessing(false);
    }
  }

  const active = state.loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const history = state.loans.filter(l => l.status === 'returned');

  return (
    <div className="p-8 space-y-8">
      {/* Active loans */}
      <div>
        <h2 className="text-base font-700 text-text mb-4">Empréstimos ativos</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {active.length === 0 ? (
            <EmptyState title="Nenhum empréstimo ativo" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                  <th className="px-6 py-3">Usuário</th>
                  <th className="px-6 py-3">Equipamento</th>
                  <th className="px-6 py-3">Data do empréstimo</th>
                  <th className="px-6 py-3">Devolução prevista</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.map(l => {
                  const eq = getEquipmentById(state.equipment, l.equipmentId);
                  const user = getUserById(state.users, l.userId);
                  return (
                    <tr key={l.id} className={`hover:bg-bg/40 transition-colors ${l.status === 'overdue' ? 'bg-danger/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent/15 text-accent font-700 text-xs flex items-center justify-center">{user?.initials}</div>
                          <span className="text-sm font-500 text-text">{user?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-500 text-text">{eq?.name}</div>
                        <div className="text-xs text-text-secondary font-mono">{eq?.tombstone} · {eq?.labName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(l.loanDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-600 ${l.status === 'overdue' ? 'text-danger' : 'text-text-secondary'}`}>
                          {formatDate(l.expectedReturn)}
                          {l.status === 'overdue' && <span className="block text-xs">Em atraso!</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4"><LoanBadge status={l.status} /></td>
                      <td className="px-6 py-4">
                        <Btn size="sm" onClick={() => setReturnTarget(l.id)}>Registrar devolução</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-700 text-text mb-4">Histórico de devoluções</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                  <th className="px-6 py-3">Usuário</th>
                  <th className="px-6 py-3">Equipamento</th>
                  <th className="px-6 py-3">Empréstimo</th>
                  <th className="px-6 py-3">Devolução</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map(l => {
                  const eq = getEquipmentById(state.equipment, l.equipmentId);
                  const user = getUserById(state.users, l.userId);
                  return (
                    <tr key={l.id} className="hover:bg-bg/40 transition-colors opacity-70">
                      <td className="px-6 py-4 text-sm font-500 text-text">{user?.name}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{eq?.name}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(l.loanDate)}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{l.actualReturn ? formatDate(l.actualReturn) : '—'}</td>
                      <td className="px-6 py-4"><LoanBadge status={l.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <Modal open={!!returnTarget} onClose={() => setReturnTarget(null)} title="Registrar devolução" size="sm">
        <div className="space-y-5">
          <div className="bg-bg rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Equipamento</span><span className="font-600 text-text">{targetEq?.name}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Usuário</span><span className="font-600 text-text">{targetUser?.name}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Data de hoje</span><span className="font-600 text-text">{new Date().toLocaleDateString('pt-BR')}</span></div>
          </div>
          <p className="text-sm text-text-secondary">Confirme o recebimento do equipamento e registre a devolução.</p>
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setReturnTarget(null)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" loading={processing} onClick={handleReturn}>Confirmar devolução</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
