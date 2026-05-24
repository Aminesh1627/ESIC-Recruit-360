import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Download, Bell, Eye, CheckCircle2, FileText, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ResultsPage() {
  const { db, commitOnChain } = useStore();
  const { t } = useLang();
  const [open, setOpen] = useState(null);

  const candidatesFor = (vacancyId) =>
    db.merit.filter(m => m.vacancyId === vacancyId).slice(0, 20)
      .concat(db.merit.slice(0, Math.max(0, 8 - db.merit.filter(m => m.vacancyId === vacancyId).length))); // ensure at least 8

  const publish = (r) => {
    commitOnChain({
      entity: 'Result', action: `Published (${r.id})`,
      mutate: (prev) => ({ ...prev, results: prev.results.map(x => x.id === r.id ? { ...x, status: 'Published', publishedAt: new Date().toISOString() } : x) }),
    });
    toast.success(`${r.vacancy} result published`);
  };

  return (
    <div>
      <PageHeader title={t('results')} subtitle="Result publishing workflow · draft → approve → publish" />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.results.map(r => (
          <Card key={r.id} className="p-5 flex flex-col" data-testid={`result-card-${r.id}`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{r.id}</div>
                <div className="font-display text-base font-semibold mt-1 truncate">{r.vacancy}</div>
                <div className="text-xs text-muted-foreground">{r.vacancyId}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-accent-soft text-accent-foreground flex items-center justify-center"><Award className="h-5 w-5" /></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Selected</div>
                <div className="font-display text-xl font-semibold mt-0.5">{r.totalSelected}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="mt-1"><StatusBadge status={r.status === 'Published' ? 'Published' : r.status === 'Approved' ? 'Approved' : 'Draft'} /></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Published {new Date(r.publishedAt).toLocaleDateString()}</div>
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(r)} data-testid={`view-result-${r.id}`}><Eye className="h-4 w-4 mr-1.5" /> View Details</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('PDF downloaded (mock)')}><Download className="h-4 w-4 mr-1.5" /> PDF</Button>
              <Button size="sm" onClick={() => toast.success('Candidates notified by SMS + Email')}><Bell className="h-4 w-4 mr-1.5" /> Notify</Button>
              {r.status !== 'Published' && (
                <Button size="sm" variant="secondary" onClick={() => publish(r)}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Publish
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-accent" /> {open?.vacancy}</DialogTitle>
            <DialogDescription>{open?.id} · {open?.vacancyId} · {open?.totalSelected} selected · {open && new Date(open.publishedAt).toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          {open && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Result ID" value={open.id} mono />
                <Stat label="Vacancy" value={open.vacancyId} mono />
                <Stat label="Status" value={<StatusBadge status={open.status} />} />
                <Stat label="Published" value={new Date(open.publishedAt).toLocaleDateString()} />
              </div>

              <Card className="p-4 bg-success-soft/50 border-success/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Verified on ESIC Chain</span>
                </div>
                <code className="text-xs font-mono text-muted-foreground">0x{open.id.toLowerCase()}…verified</code>
              </Card>

              <div>
                <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>Selected Candidates ({Math.min(open.totalSelected, 12)} of {open.totalSelected})</span>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Selected list exported as Excel')}><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
                </div>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Final Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidatesFor(open.vacancyId).slice(0, 12).map((m, i) => (
                        <TableRow key={m.id + i}>
                          <TableCell><Badge variant="outline" className="font-mono">#{i + 1}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarImage src={m.candidatePhoto} /><AvatarFallback>{m.candidateName?.[0]}</AvatarFallback></Avatar>
                              <span className="text-sm">{m.candidateName}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{m.category}</Badge></TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">{m.finalScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            <Button onClick={() => toast.success('Result PDF downloaded')}><Download className="h-4 w-4 mr-1.5" /> Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
