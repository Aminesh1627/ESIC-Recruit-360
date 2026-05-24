import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { CandidateDetailDrawer } from '@/components/candidate/CandidateDetailDrawer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, FileCheck2, FileX, ShieldAlert, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['All', 'Pending', 'Verified', 'Deficient', 'Fraud Suspected', 'Rejected'];

export default function DocumentVerificationPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState({ candidate: null, application: null });

  const filtered = useMemo(() => {
    let list = db.applications;
    if (filter !== 'All') list = list.filter(a => a.dvStatus === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a => a.candidateName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    }
    return list;
  }, [db.applications, filter, query]);

  const view = (app) => setSelected({ candidate: db.candidates.find(c => c.id === app.candidateId), application: app });

  const counts = {
    pending: db.applications.filter(a => a.dvStatus === 'Pending').length,
    verified: db.applications.filter(a => a.dvStatus === 'Verified').length,
    deficient: db.applications.filter(a => a.dvStatus === 'Deficient').length,
    fraud: db.applications.filter(a => a.dvStatus === 'Fraud Suspected').length,
  };

  return (
    <div>
      <PageHeader title={t('documentVerification')} subtitle="5-stage DV workflow · SLA-tracked" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Pending DV" value={counts.pending} icon={Clock} tone="pending" />
        <KpiCard label="Verified" value={counts.verified} icon={FileCheck2} tone="success" />
        <KpiCard label="Deficient" value={counts.deficient} icon={FileX} tone="warning" />
        <KpiCard label="Fraud Suspected" value={counts.fraud} icon={ShieldAlert} tone="destructive" />
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto justify-start">
          {STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>{s}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {s === 'All' ? db.applications.length : db.applications.filter(a => a.dvStatus === s).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by candidate or application ID…" className="pl-10" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>App ID</TableHead>
                <TableHead>{t('candidate')}</TableHead>
                <TableHead>{t('vacancy')}</TableHead>
                <TableHead>DV Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 30).map(a => {
                const cand = db.candidates.find(c => c.id === a.candidateId);
                const verified = cand?.documents.filter(d => d.status === 'Verified').length || 0;
                const total = cand?.documents.length || 0;
                return (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => view(a)}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8"><AvatarImage src={a.candidatePhoto} /><AvatarFallback>{a.candidateName[0]}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium">{a.candidateName}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm">{a.vacancyName}</span></TableCell>
                    <TableCell><StatusBadge status={a.dvStatus} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-mono">{verified}/{total}</div>
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${total ? (verified / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); view(a); }}><Eye className="h-4 w-4 mr-1" /> {t('viewDetails')}</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CandidateDetailDrawer open={!!selected.candidate} onOpenChange={(o) => !o && setSelected({ candidate: null, application: null })} candidate={selected.candidate} application={selected.application} />
    </div>
  );
}
