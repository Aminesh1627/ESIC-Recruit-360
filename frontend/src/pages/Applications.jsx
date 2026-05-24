import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CandidateDetailDrawer } from '@/components/candidate/CandidateDetailDrawer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Filter, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['All', 'Submitted', 'Under Review', 'Eligible', 'Borderline', 'Shortlisted', 'Rejected'];

export default function ApplicationsPage({ defaultFilter, title, subtitle }) {
  const { db } = useStore();
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultFilter || 'All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selected, setSelected] = useState({ candidate: null, application: null });

  const filtered = useMemo(() => {
    let list = db.applications;
    if (statusFilter !== 'All') list = list.filter(a => a.status === statusFilter);
    if (categoryFilter !== 'All') list = list.filter(a => a.category === categoryFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.candidateName.toLowerCase().includes(q) ||
        a.vacancyName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [db.applications, query, statusFilter, categoryFilter]);

  const view = (app) => {
    const cand = db.candidates.find(c => c.id === app.candidateId);
    setSelected({ candidate: cand, application: app });
  };

  return (
    <div>
      <PageHeader
        title={title || t('applications')}
        subtitle={subtitle || `${filtered.length} applications · interactive workflow`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success('Exported PDF (mock)')}>
              <Download className="h-4 w-4 mr-1.5" /> {t('exportPdf')}
            </Button>
            <Button variant="outline" onClick={() => toast.success('Exported Excel (mock)')}>
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> {t('exportExcel')}
            </Button>
          </>
        }
      />

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto justify-start">
          {STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>
              {s}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {s === 'All' ? db.applications.length : db.applications.filter(a => a.status === s).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search application ID, candidate, vacancy…" className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {['All', 'General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline"><Filter className="h-4 w-4 mr-1.5" /> {t('filter')}</Button>
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
                <TableHead>{t('category')}</TableHead>
                <TableHead className="text-right">CBT</TableHead>
                <TableHead>DV</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map(a => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => view(a)}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={a.candidatePhoto} />
                        <AvatarFallback className="text-xs">{a.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{a.candidateName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{a.candidateId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{a.vacancyName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{a.vacancyId}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${a.cbtScore >= 75 ? 'text-success' : a.cbtScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                      {a.cbtScore}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={a.dvStatus} /></TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); view(a); }}>
                      <Eye className="h-4 w-4 mr-1" /> {t('viewDetails')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          Showing first 50 of {filtered.length} applications · click any row for full enterprise drawer
        </div>
      </Card>

      <CandidateDetailDrawer
        open={!!selected.candidate}
        onOpenChange={(o) => !o && setSelected({ candidate: null, application: null })}
        candidate={selected.candidate}
        application={selected.application}
      />
    </div>
  );
}
