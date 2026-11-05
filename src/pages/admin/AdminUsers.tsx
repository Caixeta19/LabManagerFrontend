import { useState } from 'react';
import { useApp } from '../../context';
import { RoleBadge, UserStatusBadge, Btn, Modal, Input, Select, EmptyState } from '../../components/ui';
import type { User, UserRole } from '../../types';

export default function AdminUsers() {
  const { state, addUser, updateUser, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student' as UserRole, status: 'active' as User['status'] });

  const filtered = state.users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'student', status: 'active' });
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.email) return;
    if (editUser) {
      updateUser({ ...editUser, ...form });
      showToast('Usuário atualizado.');
    } else {
      addUser({
        id: `u${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        lastAccess: '—',
        initials: form.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      });
      showToast('Usuário criado.');
    }
    setModalOpen(false);
  }

  function toggleStatus(u: User) {
    updateUser({ ...u, status: u.status === 'active' ? 'inactive' : 'active' });
    showToast(`Usuário ${u.status === 'active' ? 'desativado' : 'ativado'}.`, 'info');
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
            placeholder="Pesquisar usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Btn onClick={openCreate}>+ Novo usuário</Btn>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="Nenhum usuário encontrado" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-600 text-text-secondary uppercase tracking-wider border-b border-border bg-bg/50">
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">E-mail</th>
                <th className="px-6 py-3">Perfil</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Último acesso</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-bg/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/15 text-accent font-700 text-sm flex items-center justify-center flex-shrink-0">
                        {u.initials}
                      </div>
                      <span className="text-sm font-600 text-text">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-4"><UserStatusBadge status={u.status} /></td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{u.lastAccess}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}>Editar</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => toggleStatus(u)}>
                        {u.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Editar usuário' : 'Novo usuário'}>
        <div className="space-y-4">
          <Input label="Nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
          <Input label="E-mail institucional" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="nome@instituicao.edu.br" />
          <Select label="Perfil" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
            <option value="student">Aluno</option>
            <option value="professor">Professor</option>
            <option value="admin">Admin</option>
          </Select>
          {editUser && (
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
          )}
          <div className="flex gap-3 pt-2">
            <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn className="flex-1 justify-center" onClick={handleSave}>Salvar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
