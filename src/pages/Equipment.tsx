import { useState } from 'react';
import { useApp } from '../context';
import { EquipmentBadge, Btn, Modal, Input, EmptyState } from '../components/ui';
import { getLabById } from '../data';
import type { Loan } from '../types';

export default function Equipment() {
  const { state, currentUser, addLoan, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [loanTarget, setLoanTarget] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const available = state.equipment.filter(e =>
    e.status === 'available' &&
    (e.name.toLowerCase().includes(search.toLowerCase()) ||
     e.tombstone.toLowerCase().includes(search.toLowerCase()))
  );

  const allFiltered = state.equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.tombstone.toLowerCase().includes(search.toLowerCase())
  );

  const targetEquipment = state.equipment.find(e => e.id === loanTarget);
  const targetLab = targetEquipment ? getLabById(state.labs, targetEquipment.labId) : null;
  const today = new Date().toISOString().split('T')[0];

  async function handleConfirmLoan() {
    if (!loanTarget || !returnDate || !agreed) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    const loan: Loan = {
      id: `l${Date.now()}`,
      userId: currentUser!.id,
      equipmentId: loanTarget,
      loanDate: today,
      expectedReturn: returnDate,
      status: 'active',
    };
    addLoan(loan);
    setProcessing(false);
    setLoanTarget(null);
    setReturnDate('');
    setAgreed(false);
    setSuccessModal(true);
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar equipamento ou tombo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {allFiltered.length === 0 ? (
          <EmptyState title="Nenhum equipamento encontrado" description="Tente ajustar a pesquisa." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Equipamento</th>
                <th className="px-6 py-3">Tombo</th>
                <th className="px-6 py-3">Laboratório</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Disponibilidade</th>
                <th className="px-6 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allFiltered.map(e => {
                const lab = getLabById(state.labs, e.labId);
                return (
                  <tr key={e.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-text">{e.name}</td>
                    <td className="px-6 py-4 text-sm font-500 text-text-secondary font-mono">{e.tombstone}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lab?.name}</td>
                    <td className="px-6 py-4"><EquipmentBadge status={e.status} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {e.status === 'available' ? (
                        <span className="text-success font-600">Disponível</span>
                      ) : e.status === 'in_use' ? (
                        <span className="text-text-secondary">Em uso</span>
                      ) : (
                        <span style={{ color: '#8A7B9C' }} className="font-600">Manutenção</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {e.status === 'available' ? (
                        <Btn size="sm" onClick={() => { setLoanTarget(e.id); setReturnDate(''); setAgreed(false); }}>
                          Solicitar empréstimo
                        </Btn>
                      ) : (
                        <span className="text-xs text-text-secondary">Indisponível</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Loan Modal */}
      <Modal open={!!loanTarget} onClose={() => setLoanTarget(null)} title="Solicitar empréstimo" size="md">
        {targetEquipment && (
          <div className="space-y-5">
            <div className="bg-bg rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Equipamento</span><span className="font-600 text-text">{targetEquipment.name}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Tombo</span><span className="font-600 text-text font-mono">{targetEquipment.tombstone}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Laboratório</span><span className="font-600 text-text">{targetLab?.name}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Solicitante</span><span className="font-600 text-text">{currentUser?.name}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Data de retirada</span><span className="font-600 text-text">{today.split('-').reverse().join('/')}</span></div>
            </div>

            <Input
              label="Data prevista de devolução"
              type="date"
              value={returnDate}
              min={today}
              onChange={e => setReturnDate(e.target.value)}
            />

            <div className="p-4 bg-bg rounded-xl text-xs text-text-secondary">
              <p className="font-600 text-text mb-2">Termos do empréstimo</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>O equipamento deve ser devolvido na data prevista.</li>
                <li>Danos ou perdas são de responsabilidade do solicitante.</li>
                <li>Atrasos na devolução podem gerar penalidades.</li>
                <li>O equipamento deve ser devolvido em perfeito estado.</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary"
              />
              <span className="text-sm text-text">Li e concordo com os termos do empréstimo.</span>
            </label>

            <Btn
              className="w-full justify-center"
              loading={processing}
              disabled={!returnDate || !agreed}
              onClick={handleConfirmLoan}
            >
              Confirmar empréstimo
            </Btn>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal open={successModal} onClose={() => setSuccessModal(false)} title="Empréstimo registrado!" size="sm">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-700 text-text mb-2">Empréstimo registrado com sucesso!</h3>
          <p className="text-sm text-text-secondary mb-5">Retire o equipamento no laboratório correspondente e devolva na data combinada.</p>
          <Btn variant="secondary" className="w-full justify-center" onClick={() => setSuccessModal(false)}>Fechar</Btn>
        </div>
      </Modal>
    </div>
  );
}
