import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar, Users2, Plus, Mic, Eye, Sparkles, CheckCircle2,
  ChevronLeft, ChevronRight, Clock, MapPin, BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17];

export default function InterviewsPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState('panels');
  const [scores, setScores] = useState({ technical: 75, communication: 80, leadership: 70, domain: 72, behavior: 78 });

  const weighted = ((scores.technical * 30 + scores.communication * 20 + scores.leadership * 20 + scores.domain * 20 + scores.behavior * 10) / 100).toFixed(1);

  return (
    <div>
      <PageHeader
        title={t('interviews')}
        subtitle={`${db.panels.length} interview panels · ${db.panels.reduce((s, p) => s + p.candidates, 0)} candidates scheduled`}
        actions={<Button onClick={() => toast.success('Panel creation flow (mock)')} data-testid="create-panel-btn"><Plus className="h-4 w-4 mr-1.5" /> Create Panel</Button>}
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="panels" data-testid="iv-tab-panels"><Users2 className="h-3.5 w-3.5 mr-1.5" /> Panels</TabsTrigger>
          <TabsTrigger value="schedule" data-testid="iv-tab-schedule"><Calendar className="h-3.5 w-3.5 mr-1.5" /> Schedule Calendar</TabsTrigger>
          <TabsTrigger value="panelists" data-testid="iv-tab-panelists"><BadgeCheck className="h-3.5 w-3.5 mr-1.5" /> Approved Panelists</TabsTrigger>
        </TabsList>

        <TabsContent value="panels" className="mt-4">
          <PanelsView panels={db.panels} setOpen={setOpen} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <ScheduleCalendarView panels={db.panels} setOpen={setOpen} />
        </TabsContent>

        <TabsContent value="panelists" className="mt-4">
          <PanelistsView panels={db.panels} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview Scorecard · {open?.name}</DialogTitle>
            <DialogDescription>Score candidates across weighted competencies — submission is signed on-chain.</DialogDescription>
          </DialogHeader>
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
            <Button onClick={() => { toast.success(`Interview scored: ${weighted} · Signed on-chain`); setOpen(null); }}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Submit & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Panels grid ---------- */
function PanelsView({ panels, setOpen }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {panels.map(p => (
        <Card key={p.id} className="p-5 flex flex-col" data-testid={`panel-card-${p.id}`}>
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

          <Button variant="outline" className="mt-4" onClick={() => setOpen(p)} data-testid={`conduct-interview-${p.id}`}>
            <Mic className="h-4 w-4 mr-1.5" /> Conduct Interview
          </Button>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Schedule Calendar ---------- */
function ScheduleCalendarView({ panels, setOpen }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1) + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  // Deterministic bucket panel onto a (day, hour) within the displayed week.
  const grid = useMemo(() => {
    const out = {};
    panels.forEach((p, idx) => {
      const day = idx % 7;
      const hour = HOURS[idx % HOURS.length];
      const key = `${day}-${hour}`;
      out[key] = out[key] || [];
      out[key].push(p);
    });
    return out;
  }, [panels]);

  const sameWeek = weekOffset === 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div>
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Week of {weekStart.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{panels.length} panels · approved panelists shown per slot</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)} data-testid="cal-prev-week"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant={sameWeek ? 'default' : 'outline'} size="sm" onClick={() => setWeekOffset(0)} data-testid="cal-today">Today</Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)} data-testid="cal-next-week"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          {/* Header row */}
          <div className="grid grid-cols-[60px_repeat(7,minmax(110px,1fr))] border-b border-border bg-card sticky top-0 z-10">
            <div className="p-2 text-[10px] uppercase tracking-wider text-muted-foreground"></div>
            {weekDays.map(d => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={d.toISOString()} className={cn('p-2 border-l border-border text-center', isToday && 'bg-primary-soft')}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className={cn('text-sm font-semibold', isToday && 'text-primary')}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,minmax(110px,1fr))] border-b border-border min-h-[88px]">
              <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-start justify-center pt-3 font-mono">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((_d, di) => {
                const cell = grid[`${di}-${hour}`] || [];
                return (
                  <div key={di} className="p-1.5 border-l border-border space-y-1">
                    {cell.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setOpen(p)}
                        className="w-full text-left rounded-md border border-primary/30 bg-primary-soft/60 hover:bg-primary-soft transition-colors p-1.5 group"
                        data-testid={`cal-event-${p.id}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-[10px] font-mono text-muted-foreground truncate">{p.id}</span>
                        </div>
                        <div className="text-[11px] font-medium leading-tight line-clamp-2 text-foreground">{p.vacancy}</div>
                        <div className="mt-1 flex -space-x-1.5">
                          {p.members.slice(0, 3).map((m, mi) => (
                            <Avatar key={mi} className="h-4 w-4 ring-1 ring-background">
                              <AvatarFallback className="text-[8px] bg-secondary text-secondary-foreground">{m.name.split(' ').map(s => s[0]).join('').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {p.candidates > 0 && (
                            <span className="ml-1.5 text-[9px] text-muted-foreground self-center">+{p.candidates} cand.</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Scheduled panel</span>
        <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3 w-3 text-success" /> All panelists on this calendar are approved & on-chain verified</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> Click any slot to open the scorecard</span>
      </div>
    </Card>
  );
}

/* ---------- Approved Panelists ---------- */
function PanelistsView({ panels }) {
  const panelists = useMemo(() => {
    const map = new Map();
    panels.forEach(p => p.members.forEach(m => {
      const key = `${m.name}|${m.role}`;
      if (!map.has(key)) {
        map.set(key, { name: m.name, role: m.role, weightage: m.weightage, sessions: 0, panels: [], expertise: p.vacancy });
      }
      const e = map.get(key);
      e.sessions += 1;
      e.panels.push(p.id);
    }));
    return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions);
  }, [panels]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{panelists.length} approved panelists across {panels.length} panels</p>
        <Badge variant="outline" className="gap-1"><BadgeCheck className="h-3 w-3 text-success" /> All cleared by vigilance</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {panelists.map(p => (
          <Card key={p.name + p.role} className="p-4" data-testid={`panelist-${p.name.replace(/\s/g, '-')}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary-soft text-primary text-sm font-semibold">{p.name.split(' ').map(s => s[0]).join('').slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <BadgeCheck className="h-3.5 w-3.5 text-success shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground truncate">{p.role}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <div>
                <div className="text-muted-foreground">Sessions</div>
                <div className="font-display text-base font-semibold">{p.sessions}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Weightage</div>
                <div className="font-display text-base font-semibold">{p.weightage}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 mt-0.5">Approved</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
