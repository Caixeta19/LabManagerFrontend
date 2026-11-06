import type { User, Lab, Equipment, Reservation, Loan, AppState } from './types';

export const USERS: any[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana.silva@instituicao.edu.br', role: 'student', status: 'active', lastAccess: '19/08/2026 14:32', initials: 'AS' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno.costa@instituicao.edu.br', role: 'student', status: 'active', lastAccess: '18/08/2026 09:15', initials: 'BC' },
  { id: 'u3', name: 'Carla Mendes', email: 'carla.mendes@instituicao.edu.br', role: 'student', status: 'active', lastAccess: '17/08/2026 11:00', initials: 'CM' },
  { id: 'u4', name: 'Profa. Marta Nunes', email: 'marta.nunes@instituicao.edu.br', role: 'professor', status: 'active', lastAccess: '19/08/2026 08:45', initials: 'MN' },
  { id: 'u5', name: 'Prof. Ricardo Lima', email: 'ricardo.lima@instituicao.edu.br', role: 'professor', status: 'active', lastAccess: '16/08/2026 17:20', initials: 'RL' },
  { id: 'u6', name: 'Coordenação TI', email: 'coordenacao.ti@instituicao.edu.br', role: 'admin', status: 'active', lastAccess: '19/08/2026 10:00', initials: 'TI' },
];

export const LABS: Lab[] = [
  {
    id: 'lab1',
    name: 'Lab. de Redes',
    location: 'Bloco A — Sala 101',
    capacity: 30,
    status: 'active',
    description: 'Laboratório equipado para práticas de redes de computadores, configuração de switches, roteadores e análise de tráfego.',
    resources: ['Projetor', 'Quadro branco', 'Ar-condicionado', 'Wi-Fi dedicado', '20 bancadas'],
    equipmentIds: ['eq1', 'eq2'],
    hours: 'Seg–Sex: 07h–22h',
  },
  {
    id: 'lab2',
    name: 'Lab. de Hardware',
    location: 'Bloco A — Sala 105',
    capacity: 24,
    status: 'active',
    description: 'Espaço dedicado ao estudo de arquitetura de computadores, montagem, manutenção e análise de componentes eletrônicos.',
    resources: ['Bancadas com iluminação', 'Ferramentas especializadas', 'Multímetros', 'Osciloscópios', 'Fontes reguláveis'],
    equipmentIds: ['eq3', 'eq4'],
    hours: 'Seg–Sex: 08h–20h',
  },
  {
    id: 'lab3',
    name: 'Lab. de IA & Dados',
    location: 'Bloco B — Sala 210',
    capacity: 28,
    status: 'active',
    description: 'Ambiente de alta performance para experimentos com inteligência artificial, aprendizado de máquina e ciência de dados.',
    resources: ['GPU dedicada', 'Servidores locais', 'Telas 4K', 'Cluster de processamento', 'Conexão 10Gbps'],
    equipmentIds: ['eq5'],
    hours: 'Seg–Sex: 07h–23h',
  },
  {
    id: 'lab4',
    name: 'Lab. de Robótica',
    location: 'Bloco B — Sala 215',
    capacity: 20,
    status: 'active',
    description: 'Laboratório voltado ao desenvolvimento e experimentação com sistemas robóticos, automação e eletrônica embarcada.',
    resources: ['Kits robóticos', 'Impressora 3D', 'Bancadas modulares', 'Componentes eletrônicos', 'Raspberry Pi'],
    equipmentIds: ['eq6', 'eq7'],
    hours: 'Seg–Sex: 08h–21h',
  },
];

export const EQUIPMENT: any[] = [
  { id: 'eq1', name: 'Switch Cisco Catalyst 2960', tombstone: 'TB-0101', labId: 'lab1', status: 'available', responsible: 'Coordenação TI' },
  { id: 'eq2', name: 'Analisador de Protocolo Wireshark', tombstone: 'TB-0102', labId: 'lab1', status: 'in_use', responsible: 'Coordenação TI' },
  { id: 'eq3', name: 'Osciloscópio DSO-200', tombstone: 'TB-0231', labId: 'lab2', status: 'available', responsible: 'Coordenação TI' },
  { id: 'eq4', name: 'Fonte de Alimentação DC 30V/5A', tombstone: 'TB-0232', labId: 'lab2', status: 'maintenance', responsible: 'Coordenação TI' },
  { id: 'eq5', name: 'Placa GPU NVIDIA RTX 4090', tombstone: 'TB-0310', labId: 'lab3', status: 'in_use', responsible: 'Coordenação TI' },
  { id: 'eq6', name: 'Kit Arduino Uno', tombstone: 'TB-0455', labId: 'lab4', status: 'available', responsible: 'Coordenação TI' },
  { id: 'eq7', name: 'Braço Robótico 6 Eixos', tombstone: 'TB-0456', labId: 'lab4', status: 'available', responsible: 'Coordenação TI' },
];

export const RESERVATIONS: any[] = [
  { id: 'r1', userId: 'u1', labId: 'lab1', date: '2026-08-18', startTime: '14:00', endTime: '16:00', status: 'confirmed', createdAt: '2026-08-15 10:00' },
  { id: 'r2', userId: 'u1', labId: 'lab3', date: '2026-08-20', startTime: '09:00', endTime: '11:00', status: 'pending', createdAt: '2026-08-16 09:30' },
  { id: 'r3', userId: 'u1', labId: 'lab2', date: '2026-08-22', startTime: '10:00', endTime: '12:00', status: 'pending', createdAt: '2026-08-17 15:00' },
  { id: 'r4', userId: 'u1', labId: 'lab4', date: '2026-08-10', startTime: '13:00', endTime: '15:00', status: 'expired', createdAt: '2026-08-08 11:00' },
  { id: 'r5', userId: 'u2', labId: 'lab1', date: '2026-08-19', startTime: '16:00', endTime: '18:00', status: 'confirmed', createdAt: '2026-08-14 12:00' },
  { id: 'r6', userId: 'u2', labId: 'lab3', date: '2026-08-21', startTime: '14:00', endTime: '16:00', status: 'pending', createdAt: '2026-08-17 08:00' },
  { id: 'r7', userId: 'u3', labId: 'lab2', date: '2026-08-19', startTime: '10:00', endTime: '12:00', status: 'cancelled', createdAt: '2026-08-13 14:00' },
  { id: 'r8', userId: 'u4', labId: 'lab3', date: '2026-08-19', startTime: '08:00', endTime: '10:00', status: 'confirmed', createdAt: '2026-08-10 09:00' },
];

export const LOANS: Loan[] = [
  { id: 'l1', userId: 'u1', equipmentId: 'eq6', loanDate: '2026-08-17', expectedReturn: '2026-08-21', status: 'active' },
  { id: 'l2', userId: 'u2', equipmentId: 'eq3', loanDate: '2026-08-12', expectedReturn: '2026-08-16', status: 'overdue' },
  { id: 'l3', userId: 'u3', equipmentId: 'eq1', loanDate: '2026-08-10', expectedReturn: '2026-08-14', status: 'returned', actualReturn: '2026-08-14' },
  { id: 'l4', userId: 'u1', equipmentId: 'eq7', loanDate: '2026-08-05', expectedReturn: '2026-08-07', status: 'returned', actualReturn: '2026-08-07' },
];

export const INITIAL_STATE: AppState = {
  users: USERS,
  labs: LABS,
  equipment: EQUIPMENT,
  reservations: RESERVATIONS,
  loans: LOANS,
};

export function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function getLabById(labs: Lab[], id: string) {
  return labs.find(l => l.id === id);
}

export function getUserById(users: User[], id: string) {
  return users.find(u => u.id === id);
}

export function getEquipmentById(equipment: Equipment[], id: string) {
  return equipment.find(e => e.id === id);
}
