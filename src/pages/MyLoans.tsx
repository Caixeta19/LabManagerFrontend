import { useApp } from '../context';
import { LoanBadge, Btn, AlertBanner, EmptyState } from '../components/ui';
import { formatDate, getEquipmentById, getLabById } from '../data';

export default function MyLoans() {
  const { state, currentUser, navigate } = useApp();

  const userLoans = state.loans.filter(l => l.userId === currentUser?.id);
  const overdueLoans = userLoans.filter(l => l.status === 'overdue');

  return (
    <div className="p-8 space-y-6">
      {overdueLoans.length > 0 && (
        <AlertBanner
          type="error"
          message={`Você tem ${overdueLoans.length} empréstimo(s) em atraso. Entre em contato com a coordenação para regularizar a situação.`}
        />
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {userLoans.length === 0 ? (
          <EmptyState
            title="Nenhum empréstimo"
            description="Você não possui empréstimos registrados."
            action={<Btn onClick={() => navigate('equipment')}>Ver equipamentos</Btn>}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Equipamento</th>
                <th className="px-6 py-3">Laboratório</th>
                <th className="px-6 py-3">Data do empréstimo</th>
                <th className="px-6 py-3">Devolução prevista</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userLoans.map(l => {
                const eq = getEquipmentById(state.equipment, l.equipmentId);
                const lab = eq ? getLabById(state.labs, eq.labId) : null;
                return (
                  <tr key={l.id} className={`transition-colors hover:bg-bg/40 ${l.status === 'overdue' ? 'bg-danger/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-500 text-text">{eq?.name}</div>
                      <div className="text-xs text-text-secondary font-mono">{eq?.tombstone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lab?.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(l.loanDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-600 ${l.status === 'overdue' ? 'text-danger' : 'text-text-secondary'}`}>
                        {formatDate(l.expectedReturn)}
                        {l.status === 'overdue' && (
                          <span className="block text-xs font-500 text-danger mt-0.5">Em atraso!</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4"><LoanBadge status={l.status} /></td>
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
