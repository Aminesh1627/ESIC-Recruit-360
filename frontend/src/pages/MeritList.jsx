import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Download, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function MeritListPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [tab, setTab] = useState('main');
  const [open, setOpen] = useState(null);

  const main = db.merit.slice(0, 30);
  const waiting = db.merit.slice(30);

  return (
    <div>
      <PageHeader
        title={t('meritList')}
        subtitle="Auto-generated rankings · reservation-adjusted · tie-breaks applied"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success('Merit list regenerated')}> <RefreshCw className="h-4 w-4 mr-1.5" /> Regenerate</Button>
            <Button onClick={() => toast.success('Merit list PDF exported')}>
              <Download className="h-4 w-4 mr-1.5" /> {t('exportPdf')}
            </Button>
          </>
        }
      />

      <Card className="p-5 mb-4 gradient-subtle">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Live computation</div>
            <h3 className="font-display text-xl font-semibold mt-1">Merit Score Formula</h3>
            <p className="text-sm text-muted-foreground mt-1">Final = CBT (60%) + Interview (35%) + DV Compliance (5%)</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-lg border border-border p-3 text-center bg-card">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Generated</div>
              <div className="font-display text-xl font-semibold">{db.merit.length}</div>
            </div>
            <div className="rounded-lg border border-success/30 bg-success-soft p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-success">Top Score</div>
              <div className="font-display text-xl font-semibold text-success">{db.merit[0]?.finalScore || '—'}</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="mb-3">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="main">Main Merit List <Badge variant="outline" className="ml-1.5 text-[10px]">{main.length}</Badge></TabsTrigger>
          <TabsTrigger value="waiting">Waiting List <Badge variant="outline" className="ml-1.5 text-[10px]">{waiting.length}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Rank</TableHead>
                <TableHead>{t('candidate')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead className="text-right">CBT</TableHead>
                <TableHead className="text-right">Interview</TableHead>
                <TableHead className="text-right">DV</TableHead>
                <TableHead className="text-right">Final</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tab === 'main' ? main : waiting).map(m => (
                <TableRow key={m.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${m.rank <= 3 ? 'bg-accent/20 text-accent-foreground' : 'bg-muted text-foreground'}`}>
                      {m.rank <= 3 ? <Trophy className="h-4 w-4" /> : m.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8"><AvatarImage src={m.candidatePhoto} /><AvatarFallback>{m.candidateName[0]}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{m.candidateName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{m.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm">{m.cbtScore}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{m.interviewScore}</TableCell>
                  <TableCell className="text-right"><StatusBadge status={m.dvStatus} /></TableCell>
                  <TableCell className="text-right"><span className="font-display text-sm font-semibold">{m.finalScore}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(m)}><Eye className="h-4 w-4 mr-1" /> {t('viewDetails')}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ranking Detail · #{open?.rank} {open?.candidateName}</DialogTitle>
            <DialogDescription>Weighted breakdown of CBT, Interview and DV components driving the final score.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { l: 'CBT Score (60%)', v: open?.cbtScore, w: 60 },
              { l: 'Interview Score (35%)', v: open?.interviewScore, w: 35 },
              { l: 'DV Score (5%)', v: open?.dvScore, w: 5 },
            ].map(r => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-sm">
                  <span>{r.l}</span><span className="font-mono">{r.v}</span>
                </div>
                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.v || 0}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-medium">Final Weighted Score</span>
              <span className="font-display text-2xl font-semibold text-success">{open?.finalScore}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
