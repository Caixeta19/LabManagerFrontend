import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppState, User, Page, ToastMessage, Reservation, Loan, Equipment, Lab } from './types';
import { INITIAL_STATE } from './data';

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  page: Page;
  pageParams: Record<string, string>;
  toasts: ToastMessage[];
  navigate: (page: Page, params?: Record<string, string>) => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  login: (user: User) => void;
  logout: () => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  addLoan: (l: Loan) => void;
  returnLoan: (id: string) => void;
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  addLab: (l: Lab) => void;
  updateLab: (l: Lab) => void;
  addEquipment: (e: Equipment) => void;
  updateEquipment: (e: Equipment) => void;
}

const AppContext = createContext<AppContextValue>(null!);

let toastIdCounter = 1;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('login');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const navigate = useCallback((p: Page, params: Record<string, string> = {}) => {
    setPage(p);
    setPageParams(params);
    window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = toastIdCounter++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setPage('dashboard');
    setPageParams({});
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPage('login');
    setPageParams({});
  }, []);

  const addReservation = useCallback((r: Reservation) => {
    setState(prev => ({ ...prev, reservations: [...prev.reservations, r] }));
  }, []);

  const cancelReservation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      reservations: prev.reservations.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r),
    }));
  }, []);

  const addLoan = useCallback((l: Loan) => {
    setState(prev => ({ ...prev, loans: [...prev.loans, l] }));
  }, []);

  const returnLoan = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      loans: prev.loans.map(l => l.id === id ? { ...l, status: 'returned' as const, actualReturn: today } : l),
    }));
  }, []);

  const addUser = useCallback((u: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, u] }));
  }, []);

  const updateUser = useCallback((u: User) => {
    setState(prev => ({ ...prev, users: prev.users.map(x => x.id === u.id ? u : x) }));
  }, []);

  const addLab = useCallback((l: Lab) => {
    setState(prev => ({ ...prev, labs: [...prev.labs, l] }));
  }, []);

  const updateLab = useCallback((l: Lab) => {
    setState(prev => ({ ...prev, labs: prev.labs.map(x => x.id === l.id ? l : x) }));
  }, []);

  const addEquipment = useCallback((e: Equipment) => {
    setState(prev => ({ ...prev, equipment: [...prev.equipment, e] }));
  }, []);

  const updateEquipment = useCallback((e: Equipment) => {
    setState(prev => ({ ...prev, equipment: prev.equipment.map(x => x.id === e.id ? e : x) }));
  }, []);

  return (
    <AppContext.Provider value={{
      state, currentUser, page, pageParams, toasts,
      navigate, showToast, login, logout,
      addReservation, cancelReservation,
      addLoan, returnLoan,
      addUser, updateUser,
      addLab, updateLab,
      addEquipment, updateEquipment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
