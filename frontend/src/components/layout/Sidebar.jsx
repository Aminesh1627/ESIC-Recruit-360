import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Megaphone, FileText, ListChecks, FileCheck2,
  Mic, Trophy, Award, Inbox, Cog, BookOpen, Languages, Database, Boxes,
  ShieldCheck, FlagTriangleRight, BellRing, User, CreditCard, Ticket,
  GitBranch, ScrollText
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

const ADMIN_GROUPS = (t) => ([
  {
    label: 'Recruitment',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: t('dashboard') },
      { to: '/vacancies',     icon: Briefcase,       label: t('vacancies') },
      { to: '/advertisements',icon: Megaphone,       label: t('advertisements') },
      { to: '/applications',  icon: FileText,        label: t('applications') },
      { to: '/screening',     icon: ListChecks,      label: t('screening') },
      { to: '/dv',            icon: FileCheck2,      label: t('documentVerification') },
      { to: '/interviews',    icon: Mic,             label: t('interviews') },
      { to: '/merit',         icon: Trophy,          label: t('meritList') },
      { to: '/results',       icon: Award,           label: t('results') },
      { to: '/offers',        icon: ScrollText,      label: t('offers') },
      { to: '/grievances',    icon: FlagTriangleRight,label: t('grievances') },
    ],
  },
  {
    label: 'Governance',
    items: [
      { to: '/audit',         icon: ShieldCheck,     label: t('auditLedger') },
      { to: '/reports',       icon: BookOpen,        label: t('reports') },
    ],
  },
]);

const CANDIDATE_GROUPS = (t) => ([
  {
    label: 'Candidate Portal',
    items: [
      { to: '/portal',          icon: LayoutDashboard, label: t('dashboard') },
      { to: '/portal/profile',  icon: User,            label: t('myProfile') },
      { to: '/portal/applications', icon: FileText,    label: t('applications') },
      { to: '/portal/payments', icon: CreditCard,      label: t('payments') },
      { to: '/portal/admit',    icon: Ticket,          label: t('admitCards') },
      { to: '/portal/results',  icon: Award,           label: t('results') },
      { to: '/portal/offers',   icon: ScrollText,      label: t('offers') },
      { to: '/portal/grievances', icon: FlagTriangleRight, label: t('grievances') },
      { to: '/portal/notifications', icon: BellRing,    label: t('notifications') },
    ],
  },
]);

const ADMIN_SETUP_GROUPS = (t) => ([
  {
    label: 'Super Admin',
    items: [
      { to: '/admin',                icon: LayoutDashboard, label: t('dashboard') },
      { to: '/admin/config',         icon: Cog,             label: t('systemConfig') },
      { to: '/admin/integrations',   icon: Boxes,           label: t('integrations') },
      { to: '/admin/workflow',       icon: GitBranch,       label: t('workflowDesigner') },
      { to: '/admin/roles',          icon: ShieldCheck,     label: t('roleManagement') },
      { to: '/admin/master-data',    icon: Database,        label: t('masterData') },
      { to: '/admin/translations',   icon: Languages,       label: t('translationMgmt') },
      { to: '/admin/blockchain',     icon: ShieldCheck,     label: t('blockchainSim') },
      { to: '/admin/api-catalog',    icon: BookOpen,        label: t('apiCatalog') },
    ],
  },
]);

export function Sidebar() {
  const { user } = useStore();
  const { t } = useLang();
  const location = useLocation();

  const isCandidate = user?.role === 'candidate' || location.pathname.startsWith('/portal');
  const isSuperAdmin = user?.role === 'super_admin' || location.pathname.startsWith('/admin');

  const groups = isCandidate ? CANDIDATE_GROUPS(t) : isSuperAdmin ? ADMIN_SETUP_GROUPS(t) : ADMIN_GROUPS(t);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="h-16 px-5 flex items-center border-b border-sidebar-border">
        <Logo variant="light" />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {groups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-muted font-medium">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/portal' || item.to === '/admin' || item.to === '/dashboard'}
                    className={({ isActive }) => cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-active/15 text-white shadow-[inset_2px_0_0_hsl(var(--secondary))]'
                        : 'text-sidebar-foreground/80 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-white/[0.04] p-3 border border-white/[0.06]">
          <div className="flex items-center gap-2 text-[11px] text-sidebar-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary pulse-ring" />
            Blockchain ledger active
          </div>
          <div className="mt-2 text-xs text-sidebar-foreground/80">All 120 governance events synced to ESIC chain.</div>
        </div>
        <div className="mt-3 text-[10px] text-sidebar-muted text-center">
          Powered by ESIC · FINSURGE
        </div>
      </div>
    </aside>
  );
}
