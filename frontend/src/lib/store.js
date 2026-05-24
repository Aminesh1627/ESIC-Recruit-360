import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { buildMockDb } from './mockData';
import { showTxToast } from './blockchain';

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
      if (raw) {
        const parsed = JSON.parse(raw);
        // Backward-compat: ensure new collections exist for sessions hydrated
        // from older mock seeds (workflows / roles / masterData were added later).
        const fresh = buildMockDb();
        return {
          ...parsed,
          workflows: parsed.workflows ?? fresh.workflows,
          roles: parsed.roles ?? fresh.roles,
          masterData: parsed.masterData ?? fresh.masterData,
        };
      }
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

  const _navigateToLedger = (hash) => {
    try {
      const path = hash ? `/ledger?tx=${hash}` : '/ledger';
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {}
  };

  const updateVacancyStatus = useCallback((id, status, comment) => {
    const tx = showTxToast({ entity: 'Vacancy', action: `Status → ${status} (${id})`, performedBy: 'user@esic.gov.in', onView: _navigateToLedger });
    setDb(prev => ({
      ...prev,
      vacancies: prev.vacancies.map(v => v.id === id ? {
        ...v, status,
        approvals: [...v.approvals, { stage: status, status: 'Approved', by: 'user@esic.gov.in', at: new Date().toISOString(), comment: comment || '—' }],
      } : v),
      blockchain: [{
        id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
        hash: tx.hash, timestamp: new Date().toISOString(),
        entity: 'Vacancy', action: `Status → ${status} (${id})`,
        performedBy: tx.performedBy, verified: true, gasSavings: tx.gas, block: tx.block,
      }, ...prev.blockchain],
    }));
  }, []);

  const addVacancy = useCallback((vacancy) => {
    setDb(prev => {
      const id = `VAC-2025-${(prev.vacancies.length + 1).toString().padStart(4, '0')}`;
      const tx = showTxToast({ entity: 'Vacancy', action: `Created (${id})`, performedBy: 'user@esic.gov.in', onView: _navigateToLedger });
      const newVac = {
        id, applications: 0, approvals: [],
        blockchain: { hash: tx.hash, timestamp: new Date().toISOString(), verified: true },
        createdAt: new Date().toISOString(),
        createdBy: 'user@esic.gov.in',
        status: 'Draft',
        ...vacancy,
      };
      return {
        ...prev,
        vacancies: [newVac, ...prev.vacancies],
        blockchain: [{
          id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
          hash: tx.hash, timestamp: new Date().toISOString(),
          entity: 'Vacancy', action: `Created (${id})`,
          performedBy: tx.performedBy, verified: true, gasSavings: tx.gas, block: tx.block,
        }, ...prev.blockchain],
      };
    });
  }, []);

  const updateApplicationStatus = useCallback((id, status) => {
    const tx = showTxToast({ entity: 'Application', action: `Status → ${status} (${id})`, performedBy: 'screening.officer@esic.gov.in', onView: _navigateToLedger });
    setDb(prev => ({
      ...prev,
      applications: prev.applications.map(a => a.id === id ? { ...a, status } : a),
      blockchain: [{
        id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
        hash: tx.hash, timestamp: new Date().toISOString(),
        entity: 'Application', action: `Status → ${status} (${id})`,
        performedBy: tx.performedBy, verified: true, gasSavings: tx.gas, block: tx.block,
      }, ...prev.blockchain],
    }));
  }, []);

  const updateGrievanceStatus = useCallback((id, status) => {
    const tx = showTxToast({ entity: 'Grievance', action: `Status → ${status} (${id})`, performedBy: 'grievance.officer@esic.gov.in', onView: _navigateToLedger });
    setDb(prev => ({
      ...prev,
      grievances: prev.grievances.map(g => g.id === id ? { ...g, status } : g),
      blockchain: [{
        id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
        hash: tx.hash, timestamp: new Date().toISOString(),
        entity: 'Grievance', action: `Status → ${status} (${id})`,
        performedBy: tx.performedBy, verified: true, gasSavings: tx.gas, block: tx.block,
      }, ...prev.blockchain],
    }));
  }, []);

  const updateOfferStatus = useCallback((id, status) => {
    const tx = showTxToast({ entity: 'Offer Letter', action: `Status → ${status} (${id})`, performedBy: 'hr.officer@esic.gov.in', onView: _navigateToLedger });
    setDb(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === id ? { ...o, status } : o),
      blockchain: [{
        id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
        hash: tx.hash, timestamp: new Date().toISOString(),
        entity: 'Offer Letter', action: `Status → ${status} (${id})`,
        performedBy: tx.performedBy, verified: true, gasSavings: tx.gas, block: tx.block,
      }, ...prev.blockchain],
    }));
  }, []);

  /**
   * Generic on-chain commit for arbitrary actions (workflow create, role create,
   * master data update, result publish, etc.). Logs to blockchain & fires the
   * tx toast.
   */
  const commitOnChain = useCallback(({ entity, action, performedBy = 'user@esic.gov.in', mutate }) => {
    const tx = showTxToast({ entity, action, performedBy, onView: _navigateToLedger });
    setDb(prev => {
      const block = {
        id: `BC-${(prev.blockchain.length + 1).toString().padStart(5, '0')}`,
        hash: tx.hash, timestamp: new Date().toISOString(),
        entity, action, performedBy: tx.performedBy, verified: true,
        gasSavings: tx.gas, block: tx.block,
      };
      const next = typeof mutate === 'function' ? mutate(prev) : prev;
      return { ...next, blockchain: [block, ...next.blockchain] };
    });
    return tx;
  }, []);

  const resetData = useCallback(() => { setDb(buildMockDb()); }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(() => ({
    db, setDb, user, login, logout,
    notifications, markNotificationsRead,
    addVacancy, updateVacancyStatus, updateApplicationStatus, updateGrievanceStatus, updateOfferStatus,
    commitOnChain,
    resetData, ROLES,
  }), [db, user, notifications, login, logout, addVacancy, updateVacancyStatus, updateApplicationStatus, updateGrievanceStatus, updateOfferStatus, commitOnChain, resetData, markNotificationsRead]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { ROLES };
