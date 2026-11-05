import { useState } from 'react';
import { useApp } from '../../context';
import { Btn, Modal, Input, Select, EmptyState } from '../../components/ui';
import type { Lab } from '../../types';

function LabStatusBadge({ status }: { status: Lab['status'] }) {
  const cfg = {
    active: { bg: '#D1FAE5', text: '#065F46', label: 'Ativo' },
    inactive: { bg: '#F1F5F9', text: '#64748B', label: 'Inativo' },
    maintenance: { bg: '#EDE9FE', text: '#5B21B6', label: 'Manutenção' },
  }[status];
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{cfg.label}</span>;
}

export default function AdminLabs() {
  const { state, addLab, updateLab, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [form, setForm] = useState({ name: '', location: '', capacity: 20, status: 'active' as Lab['status'], hours: '' });

  function openCreate() {
    setEditLab(null);
    setForm({ name: '', location: '', capacity: 20, status: 'active', hours: 'Seg–Sex: 08h–20h' });
    setModalOpen(true);
  }

  function openEdit(l: Lab) {
    setEditLab(l);
    setForm({ name: l.name, location: l.location, capacity: l.capacity, status: l.status, hours: l.hours });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.location) return;
    if (editLab) {
      updateLab({ ...editLab, ...form });
      showToast('Laboratório atualizado.');
    } else {
      addLab({
        id: `lab${Date.now()}`,
        name: form.name,
        location: form.location,
        capacity: form.capacity,
        status: form.status,
        hours: form.hours,
        description: '',
        resources: [],
        equipmentIds: [],
      });
      showToast('Laboratório criado.');
    }
    setModalOpen(false);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-end">
        <Btn onClick={openCreate}>+ Novo laboratório</Btn>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {state.labs.length === 0 ? (
          <EmptyState title="Nenhum laboratório cadastrado" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Localização</th>
                <th className="px-6 py-3">Capacidade</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Equipamentos</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.labs.map(l => {
                const eqCount = state.equipment.filter(e => l.equipmentIds.includes(e.id)).length;
                return (
                  <tr key={l.id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-600 text-text">{l.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{l.location}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{l.capacity} pessoas</td>
                    <td className="px-6 py-4"><LabStatusBadge status={l.status} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{eqCount} equipamento(s)</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(l)}>Editar</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => { updateLab({ ...l, status: l.status === 'active' ? 'inactive' : 'active' }); showToast('Status atualizado.', 'info'); }}>
                          {l.status === 'active' ? 'Desativar' : 'Ativar'}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editLab ? 'Editar laboratório' : 'Novo laboratório'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Lab. de Redes" />
          <Input label="Localização" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Bloco A — Sala 101" />
          <Input label="Capacidade (pessoas)" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
          <Input label="Horário de funcionamento" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="Ex: Seg–Sex: 08h–20h" />
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lab['status'] }))}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="maintenance">Manutenção</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSave}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
