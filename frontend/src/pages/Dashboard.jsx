import React from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BlockchainTimeline } from '@/components/shared/BlockchainTimeline';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Briefcase, FileText, Clock, Mic, Trophy, Award, FlagTriangleRight,
  ShieldCheck, ArrowRight, TrendingUp, Sparkles, Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, BarChart, Bar, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

const STAGE_COLORS = {
  Applications: 'hsl(220 81% 45%)',
  Screening: 'hsl(239 84% 67%)',
  CBT: 'hsl(41 80% 55%)',
  DV: 'hsl(38 92% 50%)',
  Interview: 'hsl(149 70% 40%)',
  Offers: 'hsl(142 71% 45%)',
};

export default function Dashboard() {
  const { db, user, notifications } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();

  const activeVac = db.vacancies.filter(v => ['Published', 'Approved', 'Under Review'].includes(v.status)).length;
  const pendingAppr = db.vacancies.filter(v => ['Submitted', 'Under Review', 'Finance Review', 'Reservation Review'].includes(v.status)).length;
  const eligibleApps = db.applications.filter(a => a.status === 'Eligible').length;
  const interviewsScheduled = db.panels.filter(p => p.status === 'Scheduled').length;
  const openGrievances = db.grievances.filter(g => ['Open', 'Assigned', 'In Review'].includes(g.status)).length;

  // Pipeline data
  const pipelineData = [
    { stage: 'Applications', count: db.applications.length },
    { stage: 'Screening', count: db.applications.filter(a => a.status === 'Under Review').length },
    { stage: 'CBT', count: db.applications.filter(a => a.cbtScore > 60).length },
    { stage: 'DV', count: db.applications.filter(a => a.dvStatus === 'Verified').length },
    { stage: 'Interview', count: db.panels.reduce((s, p) => s + p.candidates, 0) },
    { stage: 'Offers', count: db.offers.length },
  ];

  // Trend data
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    applications: 120 + Math.floor(Math.sin(i / 2) * 60) + i * 8,
    shortlisted: 40 + Math.floor(Math.cos(i / 2) * 25) + i * 3,
  }));

  // Category data
  const categoryData = ['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => ({
    name: c,
    value: db.applications.filter(a => a.category === c).length,
  }));
  const PIE_COLORS = ['hsl(220 81% 45%)', 'hsl(149 70% 40%)', 'hsl(41 80% 55%)', 'hsl(239 84% 67%)', 'hsl(38 92% 50%)'];

  const recentVacancies = db.vacancies.slice(0, 5);
  const recentBlockchain = db.blockchain.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl gradient-hero text-white p-6 lg:p-7">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs border border-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary pulse-ring" />
              {t('allSystemsOperational')}
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mt-3 tracking-tight">
              {t('welcomeBack')}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/75 mt-1 text-sm">
              {t('yourActivity')} · {notifications.filter(n => !n.read).length} {t('unreadNotifications')} · {pendingAppr} {t('approvalsPending')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/vacancies/new')} className="bg-white text-primary hover:bg-white/90">
              <Sparkles className="h-4 w-4 mr-1.5" /> {t('createVacancy')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/audit')} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              {t('auditLedger')} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label={t('activeVacancies')}     value={activeVac}              delta="+4.2%" icon={Briefcase}   tone="primary" />
        <KpiCard label={t('totalApplications')}    value={db.applications.length.toLocaleString()} delta="+12.6%" icon={FileText} tone="secondary" />
        <KpiCard label={t('pendingApprovals')}    value={pendingAppr}            delta="-3.1%" icon={Clock}       tone="warning" />
        <KpiCard label={t('upcomingInterviews')}  value={interviewsScheduled}    delta="+2.0%" icon={Mic}         tone="pending" />
        <KpiCard label={t('offersIssued')}        value={db.offers.length}       delta="+8.4%" icon={Award}       tone="success" />
        <KpiCard label={t('blockchainEntries')}   value={db.blockchain.length}   delta="+18%" icon={ShieldCheck} tone="accent" />
      </div>
      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">{t('recruitmentPipeline')}</h3>
              <p className="text-xs text-muted-foreground">{t('candidatesProgressing')}</p>
            </div>
            <Badge variant="outline" className="text-xs">{t('live')}</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ left: -10, top: 10, right: 10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((d) => <Cell key={d.stage} fill={STAGE_COLORS[d.stage]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold mb-1">{t('applicationsByCategory')}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t('reservationDistribution')}</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {categoryData.map((d, i) => <Cell key={d.name} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-semibold">{t('applicationTrend')}</h3>
            <p className="text-xs text-muted-foreground">{t('last12Weeks')}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> {t('yoyGrowth')}
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: -10, top: 10, right: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(220 81% 45%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(220 81% 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(149 70% 40%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(149 70% 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="applications" stroke="hsl(220 81% 45%)" strokeWidth={2} fill="url(#grad1)" />
              <Area type="monotone" dataKey="shortlisted" stroke="hsl(149 70% 40%)" strokeWidth={2} fill="url(#grad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent vacancies + Blockchain */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-semibold">{t('recentVacancies')}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/vacancies')}>
              {t('seeAll')} <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recentVacancies.map(v => (
              <li key={v.id} className="py-3 flex items-center gap-3 hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate(`/vacancies?id=${v.id}`)}>
                <div className="h-10 w-10 rounded-md bg-primary-soft text-primary flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{v.postName}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{v.id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.department} · {v.location} · {v.totalVacancies} {t('positions')}</p>
                </div>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-semibold">{t('recentEvents')}</h3>
            <Link to="/audit" className="text-xs text-primary font-medium hover:underline">{t('seeAll')}</Link>
          </div>
          <BlockchainTimeline events={recentBlockchain} compact />
        </Card>
      </div>
    </div>
  );
}
