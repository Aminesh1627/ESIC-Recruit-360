import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VacancyDetailDrawer } from '@/components/vacancy/VacancyDetailDrawer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, Filter, Download, FileSpreadsheet, Eye, Building2, MapPin,
  Users2, ArrowUpDown, Hash, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['All', 'Draft', 'Submitted', 'Under Review', 'Finance Review', 'Reservation Review', 'Approved', 'Published', 'Closed'];

export default function VacanciesPage() {
  const { db } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    const id = params.get('id');
    if (id) {
      const v = db.vacancies.find(x => x.id === id);
      if (v) setSelected(v);
    }
  }, [params, db.vacancies]);

  const filtered = useMemo(() => {
    let list = db.vacancies;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.postName.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter(v => v.status === statusFilter);
    if (groupFilter !== 'All') list = list.filter(v => v.group === groupFilter);

    list = [...list].sort((a, b) => {
      const x = a[sortKey]; const y = b[sortKey];
      if (typeof x === 'string') return sortDir === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
      return sortDir === 'asc' ? (x - y) : (y - x);
    });
    return list;
  }, [db.vacancies, query, statusFilter, groupFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const onView = (v) => {
    setSelected(v);
    setParams({ id: v.id });
  };

  return (
    <div>
      <PageHeader
        title={t('vacancies')}
        subtitle={`${filtered.length} of ${db.vacancies.length} vacancies · workflow-aware listing`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success('Exported to PDF (mock)')}>
              <Download className="h-4 w-4 mr-1.5" /> {t('exportPdf')}
            </Button>
            <Button variant="outline" onClick={() => toast.success('Exported to Excel (mock)')}>
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> {t('exportExcel')}
            </Button>
            <Button onClick={() => navigate('/vacancies/new')}>
              <Plus className="h-4 w-4 mr-1.5" /> {t('createVacancy')}
            </Button>
          </>
        }
      />

      {/* Status tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto scrollbar-thin justify-start">
          {STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>
              {s}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {s === 'All' ? db.vacancies.length : db.vacancies.filter(v => v.status === s).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, post, department, location…" className="pl-10" />
          </div>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Group" /></SelectTrigger>
            <SelectContent>
              {['All', 'A', 'B', 'C'].map(g => <SelectItem key={g} value={g}>Group {g === 'All' ? '(All)' : g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.info('Saved filter applied')}>
            <Filter className="h-4 w-4 mr-1.5" /> {t('filter')}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead onClick={() => toggleSort('id')} className="cursor-pointer">
                  <span className="inline-flex items-center gap-1">{t('vacancyId')} <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                </TableHead>
                <TableHead onClick={() => toggleSort('postName')} className="cursor-pointer">{t('postName')}</TableHead>
                <TableHead>{t('department')}</TableHead>
                <TableHead>{t('group')}</TableHead>
                <TableHead onClick={() => toggleSort('totalVacancies')} className="cursor-pointer text-right">Positions</TableHead>
                <TableHead>{t('location')}</TableHead>
                <TableHead onClick={() => toggleSort('applications')} className="cursor-pointer text-right">Applications</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 40).map(v => (
                <TableRow key={v.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => onView(v)}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{v.postName}</div>
                    <div className="text-xs text-muted-foreground">{v.postCode} · {v.cadre}</div>
                  </TableCell>
                  <TableCell><div className="inline-flex items-center gap-1.5 text-sm"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{v.department}</div></TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{v.group}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{v.totalVacancies}</TableCell>
                  <TableCell><div className="inline-flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{v.location}</div></TableCell>
                  <TableCell className="text-right"><span className="font-medium">{v.applications.toLocaleString()}</span></TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(v); }}>
                      <Eye className="h-4 w-4 mr-1" /> {t('viewDetails')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing first 40 of {filtered.length} rows · sorted by {sortKey} {sortDir}</span>
          <span className="inline-flex items-center gap-1.5"><Hash className="h-3 w-3" /> Live data backed by blockchain ledger</span>
        </div>
      </Card>

      <VacancyDetailDrawer open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setParams({}); } }} vacancy={selected} />
    </div>
  );
}
