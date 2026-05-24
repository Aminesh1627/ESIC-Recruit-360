import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { buildMockDb } from './mockData';

const StoreContext = createContext(null);

const ROLES = [
  { id: 'candidate', label: 'Candidate' },
  { id: 'recruitment_admin', label: 'Recruitment Administrator' },
  { id: 'estab_officer', label: 'Establishment Officer' },
  { id: 'dept_head', label: 'Department Head' },
  { id: 'hr_officer', label: 'HR Officer' },
  { id: 'reservation_officer', label: 'Reservation Cell Officer' },
  { id: 'finance_officer', label: 'Finance Officer' },
  { id: 'screening_officer', label: 'Screening Officer' },
  { id: 'dv_officer', label: 'DV Officer' },
  { id: 'interview_panel', label: 'Interview Panel Member' },
  { id: 'grievance_officer', label: 'Grievance Officer' },
  { id: 'competent_authority', label: 'Competent Authority' },
  { id: 'regional_director', label: 'Regional Director' },
  { id: 'super_admin', label: 'Super Admin' },
];

export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const raw = localStorage.getItem('esic_db_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return buildMockDb();
  });

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('esic_user') || 'null'); } catch (e) { return null; }
  });

  const [notifications, setNotifications] = useState(() => ([
    { id: 'n1', type: 'success', title: 'Vacancy VAC-2025-0042 approved by Finance', time: '2m ago', read: false },
    { id: 'n2', type: 'info', title: 'New application from CAN-00231 for IMO post', time: '12m ago', read: false },
    { id: 'n3', type: 'warning', title: 'DV pending for 14 candidates beyond SLA', time: '1h ago', read: false },
    { id: 'n4', type: 'info', title: 'Interview Panel PNL-006 schedule confirmed', time: '3h ago', read: true },
    { id: 'n5', type: 'success', title: 'Blockchain ledger sync complete (120 entries)', time: '5h ago', read: true },
  ]));

  useEffect(() => {
    try { localStorage.setItem('esic_db_v1', JSON.stringify(db)); } catch (e) {}
  }, [db]);

  useEffect(() => {
    if (user) localStorage.setItem('esic_user', JSON.stringify(user));
    else localStorage.removeItem('esic_user');
  }, [user]);

  const login = useCallback((username, role) => {
    const roleObj = ROLES.find(r => r.id === role) || ROLES[1];
    setUser({
      username: username || 'demo.user',
      name: (username || 'Demo User').split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      role: roleObj.id,
      roleLabel: roleObj.label,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || 'Demo User')}&backgroundType=gradientLinear`,
      email: username && username.includes('@') ? username : `${username || 'demo'}@esic.gov.in`,
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addBlockEvent = (prev, entity, action, performedBy) => ([{
    id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
    hash: '0x' + Math.random().toString(16).slice(2, 18),
    timestamp: new Date().toISOString(),
    entity, action, performedBy, verified: true,
  }, ...prev.blockchain]);

  const updateVacancyStatus = useCallback((id, status, comment) => {
    setDb(prev => ({
      ...prev,
      vacancies: prev.vacancies.map(v => v.id === id ? {
        ...v, status,
        approvals: [...v.approvals, { stage: status, status: 'Approved', by: 'user@esic.gov.in', at: new Date().toISOString(), comment: comment || '—' }],
      } : v),
      blockchain: addBlockEvent(prev, 'Vacancy', `Status → ${status} (${id})`, 'user@esic.gov.in'),
    }));
  }, []);

  const addVacancy = useCallback((vacancy) => {
    setDb(prev => {
      const id = `VAC-2025-${(prev.vacancies.length + 1).toString().padStart(4, '0')}`;
      const newVac = {
        id, applications: 0, approvals: [],
        blockchain: { hash: '0x' + Math.random().toString(16).slice(2, 18), timestamp: new Date().toISOString(), verified: true },
        createdAt: new Date().toISOString(),
        createdBy: 'user@esic.gov.in',
        status: 'Draft',
        ...vacancy,
      };
      return {
        ...prev,
        vacancies: [newVac, ...prev.vacancies],
        blockchain: addBlockEvent(prev, 'Vacancy', `Created (${id})`, 'user@esic.gov.in'),
      };
    });
  }, []);

  const updateApplicationStatus = useCallback((id, status) => {
    setDb(prev => ({
      ...prev,
      applications: prev.applications.map(a => a.id === id ? { ...a, status } : a),
      blockchain: addBlockEvent(prev, 'Application', `Status → ${status} (${id})`, 'screening.officer@esic.gov.in'),
    }));
  }, []);

  const updateGrievanceStatus = useCallback((id, status) => {
    setDb(prev => ({
      ...prev,
      grievances: prev.grievances.map(g => g.id === id ? { ...g, status } : g),
      blockchain: addBlockEvent(prev, 'Grievance', `Status → ${status} (${id})`, 'grievance.officer@esic.gov.in'),
    }));
  }, []);

  const updateOfferStatus = useCallback((id, status) => {
    setDb(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === id ? { ...o, status } : o),
      blockchain: addBlockEvent(prev, 'Offer', `Status → ${status} (${id})`, 'user@esic.gov.in'),
    }));
  }, []);

  const resetData = useCallback(() => { setDb(buildMockDb()); }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(() => ({
    db, setDb, user, login, logout,
    notifications, markNotificationsRead,
    addVacancy, updateVacancyStatus, updateApplicationStatus, updateGrievanceStatus, updateOfferStatus,
    resetData, ROLES,
  }), [db, user, notifications, login, logout, addVacancy, updateVacancyStatus, updateApplicationStatus, updateGrievanceStatus, updateOfferStatus, resetData, markNotificationsRead]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { ROLES };
