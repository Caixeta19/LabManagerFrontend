import { useState } from 'react';
import { useApp } from '../context';
import { Btn, EmptyState } from '../components/ui';
import type { Lab } from '../types';

function LabStatusDot({ status }: { status: Lab['status'] }) {
  const cfg = {
    active: { color: '#2E9E5B', label: 'Ativo' },
    inactive: { color: '#8A94A0', label: 'Inativo' },
    maintenance: { color: '#8A7B9C', label: 'Manutenção' },
  }[status];
  return (
    <span className="flex items-center gap-1.5 text-xs font-600" style={{ color: cfg.color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function LabIllustration({ labId }: { labId: string }) {
  const colors: Record<string, [string, string]> = {
    lab1: ['#1E4B5C', '#3FA796'],
    lab2: ['#153744', '#2E9E5B'],
    lab3: ['#1E4B5C', '#3FA796'],
    lab4: ['#153744', '#3FA796'],
  };
  const [c1, c2] = colors[labId] ?? ['#1E4B5C', '#3FA796'];
  return (
    <div className="h-40 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}>
      <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 21H5a2 2 0 01-2-2V7l7-4 7 4v12a2 2 0 01-2 2zM9 21V12h6v9" />
      </svg>
      <div className="absolute bottom-3 left-3 right-3">
        <div className="h-1.5 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}

export default function Labs() {
  const { state, navigate } = useApp();
  const [search, setSearch] = useState('');

  const filtered = state.labs.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar laboratório..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum laboratório encontrado" description="Tente ajustar a sua pesquisa." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filtered.map(lab => {
            const labEquipment = state.equipment.filter(e => lab.equipmentIds.includes(e.id));
            return (
              <div key={lab.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <LabIllustration labId={lab.id} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-700 text-text">{lab.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {lab.location}
                      </div>
                    </div>
                    <LabStatusDot status={lab.status} />
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{lab.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      {lab.capacity} lugares
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
                      </svg>
                      {lab.hours}
                    </span>
                  </div>

                  {/* Equipment tags */}
                  {labEquipment.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {labEquipment.slice(0, 3).map(e => (
                        <span key={e.id} className="text-xs px-2.5 py-1 bg-bg rounded-lg text-text-secondary font-500">{e.name}</span>
                      ))}
                      {labEquipment.length > 3 && (
                        <span className="text-xs px-2.5 py-1 bg-bg rounded-lg text-text-secondary font-500">+{labEquipment.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Btn variant="secondary" size="sm" className="flex-1" onClick={() => navigate('lab-detail', { id: lab.id })}>
                      Ver detalhes
                    </Btn>
                    {lab.status === 'active' && (
                      <Btn variant="primary" size="sm" className="flex-1" onClick={() => navigate('new-reservation', { labId: lab.id })}>
                        Reservar
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Lab Detail ───────────────────────────────────────────────────────────────

export function LabDetail() {
  const { state, pageParams, navigate } = useApp();
  const lab = state.labs.find(l => l.id === pageParams.id);
  if (!lab) return <div className="p-8 text-text-secondary">Laboratório não encontrado.</div>;

  const labEquipment = state.equipment.filter(e => lab.equipmentIds.includes(e.id));
  const nextSlots = [
    { date: 'Hoje', time: '14h–16h', available: true },
    { date: 'Amanhã', time: '08h–10h', available: true },
    { date: 'Amanhã', time: '14h–18h', available: false },
    { date: '21/08', time: '09h–11h', available: true },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate('labs')} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text mb-6 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
        </svg>
        Voltar aos laboratórios
      </button>

      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
        <div className="h-48 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E4B5C 0%, #3FA796 100%)' }}>
          <svg className="w-24 h-24 text-white/20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21H5a2 2 0 01-2-2V7l7-4 7 4v12a2 2 0 01-2 2zM9 21V12h6v9" />
          </svg>
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl font-800 text-white">{lab.name}</h1>
            <p className="text-white/70 text-sm mt-0.5">{lab.location}</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div>
              <h3 className="text-sm font-600 text-text-secondary uppercase tracking-wide mb-2">Descrição</h3>
              <p className="text-sm text-text leading-relaxed">{lab.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-600 text-text-secondary uppercase tracking-wide mb-2">Recursos disponíveis</h3>
              <div className="flex flex-wrap gap-2">
                {lab.resources.map(r => (
                  <span key={r} className="text-xs px-3 py-1.5 bg-bg border border-border rounded-lg text-text font-500">{r}</span>
                ))}
              </div>
            </div>
            {labEquipment.length > 0 && (
              <div>
                <h3 className="text-sm font-600 text-text-secondary uppercase tracking-wide mb-2">Equipamentos</h3>
                <div className="space-y-2">
                  {labEquipment.map(e => (
                    <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <span className="font-500 text-text">{e.name}</span>
                      <span className="text-xs text-text-secondary">{e.tombstone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-bg rounded-xl p-4 space-y-3">
              <div><div className="text-xs text-text-secondary">Capacidade</div><div className="text-sm font-600 text-text mt-0.5">{lab.capacity} pessoas</div></div>
              <div><div className="text-xs text-text-secondary">Funcionamento</div><div className="text-sm font-600 text-text mt-0.5">{lab.hours}</div></div>
              <div><div className="text-xs text-text-secondary">Status</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-600 mt-0.5" style={{ color: '#2E9E5B' }}>
                  <span className="w-2 h-2 rounded-full bg-success" />Ativo
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-600 text-text-secondary uppercase tracking-wide mb-2">Próximos horários</h3>
              <div className="space-y-2">
                {nextSlots.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-600 text-text">{s.date}</div>
                      <div className="text-text-secondary">{s.time}</div>
                    </div>
                    <span className="font-600" style={{ color: s.available ? '#2E9E5B' : '#C4433A' }}>
                      {s.available ? 'Disponível' : 'Ocupado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          {lab.status === 'active' && (
            <Btn onClick={() => navigate('new-reservation', { labId: lab.id })} className="w-full justify-center py-3">
              Reservar laboratório
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
