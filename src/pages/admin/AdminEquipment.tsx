import { useState } from 'react';
import { useApp } from '../../context';
import { EquipmentBadge, Btn, Modal, Input, Select, EmptyState } from '../../components/ui';
import { getLabById } from '../../data';
import type { Equipment } from '../../types';

export default function AdminEquipment() {
  const { state, addEquipment, updateEquipment, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEq, setEditEq] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: '', tombstone: '', labId: '', status: 'available' as Equipment['status'], responsible: 'Coordenação TI' });

  const filtered = state.equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.tombstone.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditEq(null);
    setForm({ name: '', tombstone: '', labId: state.labs[0]?.id ?? '', status: 'available', responsible: 'Coordenação TI' });
    setModalOpen(true);
  }

  function openEdit(e: Equipment) {
    setEditEq(e);
    setForm({ name: e.name, tombstone: e.tombstone, labId: e.labId, status: e.status, responsible: e.responsible });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.tombstone || !form.labId) return;
    if (editEq) {
      updateEquipment({ ...editEq, ...form });
      showToast('Equipamento atualizado.');
    } else {
      addEquipment({ id: `eq${Date.now()}`, ...form });
      showToast('Equipamento cadastrado.');
    }
    setModalOpen(false);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
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
        <Btn onClick={openCreate}>+ Novo equipamento</Btn>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="Nenhum equipamento encontrado" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Equipamento</th>
                <th className="px-6 py-3">Tombo</th>
                <th className="px-6 py-3">Laboratório</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Responsável</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(e => {
                const lab = getLabById(state.labs, e.labId);
                return (
                  <tr key={e.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-text">{e.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-text-secondary">{e.tombstone}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{lab?.name}</td>
                    <td className="px-6 py-4"><EquipmentBadge status={e.status} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{e.responsible}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(e)}>Editar</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => {
                          const next = e.status === 'available' ? 'maintenance' : 'available';
                          updateEquipment({ ...e, status: next });
                          showToast('Status atualizado.', 'info');
                        }}>
                          Alterar status
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editEq ? 'Editar equipamento' : 'Novo equipamento'}>
        <div className="space-y-4">
          <Input label="Nome do equipamento" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Osciloscópio DSO-200" />
          <Input label="Tombo" value={form.tombstone} onChange={e => setForm(f => ({ ...f, tombstone: e.target.value }))} placeholder="Ex: TB-0231" />
          <Select label="Laboratório" value={form.labId} onChange={e => setForm(f => ({ ...f, labId: e.target.value }))}>
            <option value="">Selecione</option>
            {state.labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Equipment['status'] }))}>
            <option value="available">Disponível</option>
            <option value="in_use">Em uso</option>
            <option value="maintenance">Manutenção</option>
          </Select>
          <Input label="Responsável" value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSave}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
