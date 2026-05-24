import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users2, Plus, Mic, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewsPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [open, setOpen] = useState(null);
  const [scores, setScores] = useState({ technical: 75, communication: 80, leadership: 70, domain: 72, behavior: 78 });

  const weighted = ((scores.technical * 30 + scores.communication * 20 + scores.leadership * 20 + scores.domain * 20 + scores.behavior * 10) / 100).toFixed(1);

  return (
    <div>
      <PageHeader
        title={t('interviews')}
        subtitle={`${db.panels.length} interview panels · ${db.panels.reduce((s, p) => s + p.candidates, 0)} candidates scheduled`}
        actions={<Button onClick={() => toast.success('Panel creation flow (mock)')}><Plus className="h-4 w-4 mr-1.5" /> Create Panel</Button>}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.panels.map(p => (
          <Card key={p.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{p.id}</div>
                <div className="font-display text-base font-semibold mt-1">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.vacancy}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="flex -space-x-2 mt-4">
              {p.members.map((m, i) => (
                <Avatar key={i} className="h-9 w-9 ring-2 ring-background">
                  <AvatarFallback className="text-xs bg-primary-soft text-primary">{m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
              {p.members.map((m, i) => <div key={i}>• {m.role}: {m.name} <span className="font-mono">({m.weightage}%)</span></div>)}
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Candidates</div>
                <div className="font-display text-xl font-semibold flex items-center gap-1.5 mt-0.5"><Users2 className="h-4 w-4 text-primary" />{p.candidates}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Schedule</div>
                <div className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-secondary" />{new Date(p.schedule).toLocaleDateString()}</div>
              </div>
            </div>

            <Button variant="outline" className="mt-4 mt-auto" onClick={() => setOpen(p)}>
              <Mic className="h-4 w-4 mr-1.5" /> Conduct Interview
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Interview Scorecard · {open?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Card className="p-4 bg-primary-soft/50 border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarImage src="https://i.pravatar.cc/120?img=15" /></Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">Candidate Profile</div>
                  <div className="text-xs text-muted-foreground">5 yrs total · 3 yrs relevant · B.Tech CSE · IIT Delhi</div>
                </div>
                <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Full Profile</Button>
              </div>
            </Card>
            {[
              { key: 'technical', label: 'Technical Depth', weight: 30 },
              { key: 'communication', label: 'Communication', weight: 20 },
              { key: 'leadership', label: 'Leadership', weight: 20 },
              { key: 'domain', label: 'Domain Knowledge', weight: 20 },
              { key: 'behavior', label: 'Behavior & Ethics', weight: 10 },
            ].map(c => (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">{c.label} <span className="text-xs text-muted-foreground">(weight {c.weight}%)</span></Label>
                  <span className="font-mono text-sm font-medium">{scores[c.key]}/100</span>
                </div>
                <Slider value={[scores[c.key]]} max={100} step={1} onValueChange={(v) => setScores({ ...scores, [c.key]: v[0] })} />
              </div>
            ))}
            <Textarea placeholder="Panel observations, recommendations…" rows={3} />
            <Card className="p-3 bg-success-soft border-success/30 flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-success" /><span className="text-sm font-medium">Weighted Final Score</span></div>
              <span className="font-display text-2xl font-semibold text-success">{weighted}</span>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            <Button onClick={() => { toast.success(`Interview scored: ${weighted}· Signed on-chain`); setOpen(null); }}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Submit & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
