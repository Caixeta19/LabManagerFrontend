import { useState } from 'react';
import { useApp } from '../../context';
import { Btn, Modal, Input, Select, EmptyState } from '../../components/ui';
import { ApiError } from '../../api';
import type { Lab } from '../../types';
import LabCheckinQr from '../../components/LabCheckinQr';
import { DIAS_CURTOS, ORDEM_DIAS, labHorarioResumo } from '../../utils';

function splitResources(text: string) {
  return text.split(/[,\n]/).map(r => r.trim()).filter(Boolean);
}

function LabStatusBadge({ status }: { status: Lab['status'] }) {
  const cfg = {
    active: { bg: '#D1FAE5', text: '#065F46', label: 'Ativo' },
    inactive: { bg: '#F1F5F9', text: '#64748B', label: 'Inativo' },
    maintenance: { bg: '#EDE9FE', text: '#5B21B6', label: 'Manutenção' },
  }[status];
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{cfg.label}</span>;
}

export default function AdminLabs() {
  const { state, addLab, updateLab, showToast, handleError } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [qrLab, setQrLab] = useState<Lab | null>(null);
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [form, setForm] = useState({ name: '', location: '', capacity: 20, status: 'active' as Lab['status'], hours: '', description: '', resources: '', bookingOpenTime: '', bookingCloseTime: '', bookingDays: [] as number[] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditLab(null);
    setForm({ name: '', location: '', capacity: 20, status: 'active', hours: '', description: '', resources: '', bookingOpenTime: '08:00', bookingCloseTime: '20:00', bookingDays: [1, 2, 3, 4, 5] });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(l: Lab) {
    setEditLab(l);
    setForm({ name: l.name, location: l.location, capacity: l.capacity, status: l.status, hours: l.hours, description: l.description, resources: l.resources.join(', '), bookingOpenTime: l.bookingOpenTime, bookingCloseTime: l.bookingCloseTime, bookingDays: l.bookingDays });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const missing: Record<string, string> = {};
    if (!form.name.trim()) missing.name = 'Informe o nome.';
    if (!form.location.trim()) missing.localization = 'Informe a localização.';
    if (form.capacity <= 0) missing.capacity = 'A capacidade deve ser maior que zero.';
    if (!!form.bookingOpenTime !== !!form.bookingCloseTime) {
      missing.bookingWindow = 'Informe a abertura e o fechamento, ou deixe os dois vazios.';
    } else if (form.bookingOpenTime && form.bookingOpenTime >= form.bookingCloseTime) {
      missing.bookingWindow = 'A abertura deve ser antes do fechamento.';
    }
    if (form.bookingDays.length === 0) missing.bookingDays = 'Selecione ao menos um dia de funcionamento.';
    setErrors(missing);
    if (Object.keys(missing).length) return;

    const input = { ...form, resources: splitResources(form.resources) };

    setSaving(true);
    try {
      if (editLab) {
        await updateLab(editLab.id, input);
        showToast('Laboratório atualizado.');
      } else {
        await addLab(input);
        showToast('Laboratório criado.');
      }
      setModalOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(error.fields);
      } else if (error instanceof ApiError && error.code === 'ERR_LAB_003') {
        setErrors({ bookingWindow: error.message });
      } else {
        handleError(error);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(l: Lab) {
    try {
      await updateLab(l.id, { ...l, status: l.status === 'active' ? 'inactive' : 'active' });
      showToast('Status atualizado.', 'info');
    } catch (error) {
      handleError(error);
    }
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
                <th className="px-6 py-3">Funcionamento</th>
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
                    <td className="px-6 py-4 text-sm text-text-secondary">{labHorarioResumo(l)}</td>
                    <td className="px-6 py-4"><LabStatusBadge status={l.status} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{eqCount} equipamento(s)</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(l)}>Editar</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => setQrLab(l)}>QR de check-in</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => toggleStatus(l)}>
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
          <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Lab. de Redes" error={errors.name} />
          <Input label="Localização" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Bloco A — Sala 101" error={errors.localization} />
          <Input label="Capacidade (pessoas)" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} error={errors.capacity} />
          <Input label="Observação sobre o horário (opcional)" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="Ex: Fechado nos feriados" error={errors.openingHours} />
          <div>
            <label className="text-sm font-600 text-text block mb-1.5">Dias de funcionamento</label>
            <div className="flex flex-wrap gap-2">
              {ORDEM_DIAS.map(d => {
                const ativo = form.bookingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setForm(f => ({ ...f, bookingDays: ativo ? f.bookingDays.filter(x => x !== d) : [...f.bookingDays, d] }))}
                    className={`px-3 py-1.5 text-sm font-600 rounded-lg border transition-colors ${ativo ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:bg-bg'}`}
                  >
                    {DIAS_CURTOS[d]}
                  </button>
                );
              })}
            </div>
            {errors.bookingDays && <span className="text-xs text-danger mt-1 block">{errors.bookingDays}</span>}
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Abre às" type="time" step={60} value={form.bookingOpenTime} onChange={e => setForm(f => ({ ...f, bookingOpenTime: e.target.value }))} />
              <Input label="Fecha às" type="time" step={60} value={form.bookingCloseTime} onChange={e => setForm(f => ({ ...f, bookingCloseTime: e.target.value }))} />
            </div>
            {errors.bookingWindow
              ? <span className="text-xs text-danger mt-1 block">{errors.bookingWindow}</span>
              : <span className="text-xs text-text-secondary mt-1 block">Alunos e professores só reservam nesses dias e horário, com início e fim no mesmo dia. Deixe o horário vazio para não restringir a hora. O administrador não tem restrição.</span>}
          </div>
          <Input label="Recursos" value={form.resources} onChange={e => setForm(f => ({ ...f, resources: e.target.value }))} placeholder="Separados por vírgula. Ex: Projetor, Quadro branco" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-600 text-text">Descrição</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg text-text placeholder-text-secondary resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lab['status'] }))}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="maintenance">Manutenção</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" loading={saving} onClick={handleSave}>Salvar</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!qrLab} onClose={() => setQrLab(null)} title={qrLab ? `QR de check-in — ${qrLab.name}` : ''} size="sm">
        {qrLab && <LabCheckinQr lab={qrLab} />}
      </Modal>
    </div>
  );
}
