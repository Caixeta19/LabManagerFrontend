import { useState } from 'react';
import { useApp } from '../../context';
import { EquipmentBadge, Btn, Modal, Input, Select, EmptyState } from '../../components/ui';
import { ApiError } from '../../api';
import type { Equipment } from '../../types';

export default function AdminEquipment() {
  const { state, addEquipment, updateEquipment, showToast, handleError } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEq, setEditEq] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: '', tombstone: '', labId: '', status: 'available' as Equipment['status'], responsible: 'Coordenação TI' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Não se cadastra equipamento em laboratório inativo; o laboratório atual continua na lista
  const selectableLabs = state.labs.filter(l => l.status !== 'inactive' || l.id === editEq?.labId);

  const filtered = state.equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.tombstone.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditEq(null);
    setForm({ name: '', tombstone: '', labId: state.labs.find(l => l.status !== 'inactive')?.id ?? '', status: 'available', responsible: 'Coordenação TI' });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(e: Equipment) {
    setEditEq(e);
    setForm({ name: e.name, tombstone: e.tombstone, labId: e.labId, status: e.status, responsible: e.responsible });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const missing: Record<string, string> = {};
    if (!form.name.trim()) missing.name = 'Informe o nome do equipamento.';
    if (!form.tombstone.trim()) missing.heritage = 'Informe o tombo.';
    if (!form.labId) missing.laboratoryId = 'Selecione um laboratório.';
    setErrors(missing);
    if (Object.keys(missing).length) return;

    setSaving(true);
    try {
      if (editEq) {
        await updateEquipment(editEq.id, form);
        showToast('Equipamento atualizado.');
      } else {
        await addEquipment(form);
        showToast('Equipamento cadastrado.');
      }
      setModalOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'ERR_EQUIP_002') {
        setErrors({ heritage: error.message });
      } else if (error instanceof ApiError && error.status === 422) {
        setErrors(error.fields);
      } else {
        handleError(error);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(e: Equipment) {
    try {
      await updateEquipment(e.id, { ...e, status: e.status === 'available' ? 'maintenance' : 'available' });
      showToast('Status atualizado.', 'info');
    } catch (error) {
      handleError(error);
    }
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
                return (
                  <tr key={e.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-text">{e.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-text-secondary">{e.tombstone}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{e.labName}</td>
                    <td className="px-6 py-4"><EquipmentBadge status={e.status} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{e.responsible}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(e)}>Editar</Btn>
                        <Btn variant="ghost" size="sm" disabled={e.status === 'in_use'} onClick={() => toggleStatus(e)}>
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
          <Input label="Nome do equipamento" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Osciloscópio DSO-200" error={errors.name} />
          <Input label="Tombo" value={form.tombstone} onChange={e => setForm(f => ({ ...f, tombstone: e.target.value }))} placeholder="Ex: TB-0231" error={errors.heritage} />
          <Select label="Laboratório" value={form.labId} onChange={e => setForm(f => ({ ...f, labId: e.target.value }))} error={errors.laboratoryId}>
            <option value="">Selecione</option>
            {selectableLabs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
          {editEq && (
            <Select
              label="Status"
              value={form.status}
              disabled={form.status === 'in_use'}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Equipment['status'] }))}
            >
              {form.status === 'in_use' && <option value="in_use">Em uso (controlado pelo empréstimo)</option>}
              <option value="available">Disponível</option>
              <option value="maintenance">Manutenção</option>
            </Select>
          )}
          <Input label="Responsável" value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} error={errors.responsible} />
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" loading={saving} onClick={handleSave}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
