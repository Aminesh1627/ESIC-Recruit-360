import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Search, Eye, Plus, FlagTriangleRight, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const STATUSES = ['All', 'Open', 'Assigned', 'In Review', 'Resolved', 'Closed', 'Rejected'];

export default function GrievancesPage() {
  const { db, updateGrievanceStatus } = useStore();
  const { t } = useLang();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    let list = db.grievances;
    if (filter !== 'All') list = list.filter(g => g.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(g => g.id.toLowerCase().includes(q) || g.candidateName.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q));
    }
    return list;
  }, [db.grievances, filter, query]);

  return (
    <div>
      <PageHeader title={t('grievances')} subtitle={`${filtered.length} of ${db.grievances.length} tickets · SLA-tracked`} />

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto justify-start">
          {STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>{s}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {s === 'All' ? db.grievances.length : db.grievances.filter(g => g.status === s).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, subject, candidate…" className="pl-10" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>{t('candidate')}</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 30).map(g => (
              <TableRow key={g.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setOpen(g)}>
                <TableCell className="font-mono text-xs">{g.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{g.subject}</div>
                  <div className="text-[11px] text-muted-foreground">{g.type}</div>
                </TableCell>
                <TableCell><span className="text-sm">{g.candidateName}</span></TableCell>
                <TableCell><StatusBadge status={g.priority} /></TableCell>
                <TableCell>
                  <div className={`text-xs font-medium ${g.sla < 3 ? 'text-destructive' : g.sla < 7 ? 'text-warning' : 'text-success'}`}>{g.sla} days left</div>
                </TableCell>
                <TableCell><StatusBadge status={g.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpen(g); }}><Eye className="h-4 w-4 mr-1" /> View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FlagTriangleRight className="h-5 w-5 text-warning" /> {open?.id} · {open?.subject}</DialogTitle>
            <DialogDescription>Review the grievance, capture resolution notes and route to the next stage.</DialogDescription>
          </DialogHeader>
          {open && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Type" value={open.type} />
                <Field label="Priority" value={<StatusBadge status={open.priority} />} />
                <Field label="Candidate" value={open.candidateName} />
                <Field label="Assigned To" value={open.assignedTo} />
                <Field label="Raised" value={new Date(open.raisedAt).toLocaleString()} />
                <Field label="Status" value={<StatusBadge status={open.status} />} />
              </div>
              <Textarea placeholder="Resolution notes…" rows={3} />
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { updateGrievanceStatus(open?.id, 'Assigned'); toast.success('Assigned to officer'); setOpen(null); }}><ArrowUpRight className="h-4 w-4 mr-1.5" /> Assign</Button>
            <Button variant="outline" onClick={() => { updateGrievanceStatus(open?.id, 'In Review'); toast.success('Moved to review'); setOpen(null); }}>Move to Review</Button>
            <Button onClick={() => { updateGrievanceStatus(open?.id, 'Resolved'); toast.success('Resolved & signed on-chain'); setOpen(null); }}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
