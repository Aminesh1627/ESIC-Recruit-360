import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, CreditCard, Ticket, Award, ScrollText, FlagTriangleRight, BellRing,
  User, ShieldCheck, Download, Upload, CheckCircle2, Clock, AlertTriangle,
  Sparkles, ArrowRight, MapPin, Briefcase, Calendar, Mail, Phone, Plus,
  GraduationCap, Building2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BlockchainTimeline } from '@/components/shared/BlockchainTimeline';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STAGES = ['Submitted', 'Eligibility Verified', 'Admit Card', 'CBT', 'DV', 'Interview', 'Result'];

export default function CandidatePortal() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { db, user, notifications } = useStore();
  const { t } = useLang();

  // For demo: pick a representative candidate from the mock data and attach to logged in user
  const candidate = useMemo(() => db.candidates[0], [db.candidates]);
  const myApplications = useMemo(
    () => db.applications.filter(a => a.candidateId === candidate.id).slice(0, 6),
    [db.applications, candidate.id]
  );
  // Fallback so the demo always shows something
  const apps = myApplications.length ? myApplications : db.applications.slice(0, 5).map(a => ({ ...a, candidateName: `${candidate.firstName} ${candidate.lastName}` }));

  const myOffers = db.offers.slice(0, 1);
  const myGrievances = db.grievances.slice(0, 3);
  const myResults = db.results.slice(0, 3);

  const tab = section || 'overview';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('welcomeBack')}, ${candidate.firstName}`}
        subtitle="Your unified candidate workspace · Track applications, results & offers in real time."
        badge={<Badge variant="outline" className="gap-1 ml-1"><ShieldCheck className="h-3 w-3" /> Aadhaar Verified</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" data-testid="portal-download-profile">
              <Download className="h-4 w-4 mr-1.5" /> Profile PDF
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" data-testid="portal-find-vacancies"
              onClick={() => toast.info('Browse open vacancies (demo)')}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Browse Vacancies
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => navigate(v === 'overview' ? '/portal' : `/portal/${v}`)}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto" data-testid="portal-tabs">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
          <TabsTrigger value="admit" data-testid="tab-admit">Admit</TabsTrigger>
          <TabsTrigger value="grievances" data-testid="tab-grievances">Grievances</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <OverviewSection candidate={candidate} apps={apps} db={db} notifications={notifications} />
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 mt-6">
          <ApplicationsSection apps={apps} db={db} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <ProfileSection candidate={candidate} user={user} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-6">
          <PaymentsSection apps={apps} />
        </TabsContent>

        <TabsContent value="admit" className="space-y-4 mt-6">
          <AdmitCardsSection apps={apps} />
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4 mt-6">
          <GrievancesSection candidate={candidate} myGrievances={myGrievances} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewSection({ candidate, apps, db, notifications }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Active Applications" value={apps.length} icon={FileText} tone="primary" delta="+2" />
        <KpiCard label="Profile Strength" value={`${candidate.profileCompleteness}%`} icon={User} tone="success" sublabel="Complete remaining 3 fields" />
        <KpiCard label="Upcoming Tests" value={apps.filter(a => a.status !== 'Rejected').length} icon={Ticket} tone="warning" sublabel="Admit cards available" />
        <KpiCard label="Results Awaited" value={db.results.length} icon={Award} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">My Recruitment Journey</h3>
              <p className="text-xs text-muted-foreground">Live status across all active applications · blockchain-verified</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/portal/applications')} data-testid="overview-see-all-applications">
              See all <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-5">
            {apps.slice(0, 3).map((a, idx) => {
              const stageIdx = Math.min(STAGES.length - 1, 2 + (idx % 3));
              return (
                <div key={a.id} className="rounded-lg border border-border p-4 hover:border-primary/40 transition-colors" data-testid={`overview-app-${a.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{a.vacancyName}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">{a.id}</span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Submitted {new Date(a.submittedAt).toLocaleDateString()} · CBT score {a.cbtScore}/100</p>
                    </div>
                  </div>

                  {/* Stage tracker */}
                  <div className="mt-4 flex items-center">
                    {STAGES.map((s, i) => {
                      const done = i <= stageIdx;
                      const active = i === stageIdx;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center min-w-0">
                            <div className={cn(
                              'h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-colors',
                              done ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground',
                              active && 'ring-4 ring-primary/15'
                            )}>
                              {done && !active ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <p className={cn('mt-1 text-[10px] text-center leading-tight max-w-[60px]', done ? 'text-foreground font-medium' : 'text-muted-foreground')}>{s}</p>
                          </div>
                          {i < STAGES.length - 1 && (
                            <div className={cn('flex-1 h-0.5 mx-1 -translate-y-2.5', i < stageIdx ? 'bg-primary' : 'bg-border')} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold mb-3">Notifications</h3>
          <div className="space-y-2">
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} className={cn('rounded-md border p-3 text-sm', !n.read ? 'border-primary/30 bg-primary-soft' : 'border-border')}>
                <p className="font-medium leading-tight">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold mb-3">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Upload Documents', icon: Upload, to: '/portal/profile', tone: 'bg-primary/10 text-primary' },
              { label: 'Pay Application Fee', icon: CreditCard, to: '/portal/payments', tone: 'bg-secondary/10 text-secondary' },
              { label: 'Download Admit Card', icon: Ticket, to: '/portal/admit', tone: 'bg-warning/15 text-warning' },
              { label: 'Check Results', icon: Award, to: '/portal/results', tone: 'bg-success/15 text-success' },
              { label: 'View Offer Letter', icon: ScrollText, to: '/portal/offers', tone: 'bg-accent/15 text-accent-foreground' },
              { label: 'Lodge Grievance', icon: FlagTriangleRight, to: '/portal/grievances', tone: 'bg-destructive/10 text-destructive' },
            ].map(q => (
              <button
                key={q.label}
                onClick={() => navigate(q.to)}
                className="rounded-lg border border-border p-4 text-left hover:border-primary hover:bg-primary-soft/50 transition-colors group"
                data-testid={`quick-action-${q.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={cn('h-9 w-9 rounded-md flex items-center justify-center mb-3', q.tone)}>
                  <q.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm font-medium">{q.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Go to section</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold mb-3">My Audit Trail</h3>
          <BlockchainTimeline events={db.blockchain.slice(0, 5)} compact />
        </Card>
      </div>
    </>
  );
}

/* ---------- Applications ---------- */
function ApplicationsSection({ apps, db }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">My Applications</h3>
          <p className="text-xs text-muted-foreground">{apps.length} active · all entries hashed on-chain</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
      </div>
      <div className="divide-y divide-border">
        {apps.map(a => {
          const vac = db.vacancies.find(v => v.id === a.vacancyId);
          return (
            <div key={a.id} className="p-5 hover:bg-muted/30 transition-colors" data-testid={`my-app-row-${a.id}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-11 w-11 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{a.vacancyName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">{a.id}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vac?.location || '—'}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(a.submittedAt).toLocaleDateString()}</span>
                      <span>CBT {a.cbtScore}/100</span>
                      <span>DV: {a.dvStatus}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" data-testid={`view-app-${a.id}`}>View Details</Button>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- Profile ---------- */
function ProfileSection({ candidate, user }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={candidate.photo} />
            <AvatarFallback>{candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">{candidate.firstName} {candidate.lastName}</p>
            <p className="text-xs text-muted-foreground">{candidate.id}</p>
            <Badge variant="outline" className="mt-1 text-[10px]">{candidate.category}</Badge>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs text-muted-foreground mb-1.5">Profile Completeness</p>
          <Progress value={candidate.profileCompleteness} className="h-2" />
          <p className="text-xs mt-1.5 text-success font-medium">{candidate.profileCompleteness}% complete</p>
        </div>

        <ul className="mt-5 space-y-2.5 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> <span className="truncate">{candidate.email}</span></li>
          <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {candidate.mobile}</li>
          <li className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {candidate.state}, {candidate.district}</li>
          <li className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" /> Aadhaar Verified · DigiLocker linked</li>
        </ul>
      </Card>

      <Card className="p-5 lg:col-span-2 space-y-6">
        <div>
          <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</h3>
          <div className="space-y-2">
            {candidate.education.map((e, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{e.degree}</p>
                  <p className="text-xs text-muted-foreground">{e.institute} · {e.year}</p>
                </div>
                <Badge variant="outline">{e.percent}%</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> Experience</h3>
          <div className="space-y-2">
            {candidate.experience.map((x, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{x.designation} · {x.company}</p>
                  <span className="text-xs text-muted-foreground">{x.startDate.slice(0, 4)} – {x.endDate.slice(0, 4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold mb-3">Documents</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {candidate.documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">{d.name}</span>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" data-testid="upload-document-btn">
            <Upload className="h-4 w-4 mr-1.5" /> Upload missing documents
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Payments ---------- */
function PaymentsSection({ apps }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-display text-base font-semibold">Application Fees & Payments</h3>
        <p className="text-xs text-muted-foreground">All payments are receipted on-chain.</p>
      </div>
      <div className="divide-y divide-border">
        {apps.map((a, i) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium">{a.vacancyName}</p>
              <p className="text-xs text-muted-foreground">Receipt RCP-{a.id.slice(-6)} · ₹{500 + i * 100}.00</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">Paid</Badge>
              <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1.5" /> Receipt</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Admit Cards ---------- */
function AdmitCardsSection({ apps }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {apps.slice(0, 3).map((a, i) => (
        <Card key={a.id} className="p-5 hover:shadow-elevated transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <Ticket className="h-5 w-5 text-warning" />
            <Badge variant="outline" className="text-[10px]">{i === 0 ? 'Available' : 'Available soon'}</Badge>
          </div>
          <p className="text-sm font-semibold">{a.vacancyName}</p>
          <p className="text-xs text-muted-foreground mt-1">Exam: 14 Mar 2026 · 10:00 AM</p>
          <p className="text-xs text-muted-foreground">Centre: Govt. Higher Sec. School, Delhi</p>
          <div className="mt-4 flex items-center justify-between">
            <Button size="sm" variant={i === 0 ? 'default' : 'outline'} disabled={i !== 0} data-testid={`admit-download-${a.id}`}>
              <Download className="h-4 w-4 mr-1.5" /> {i === 0 ? 'Download' : 'Locked'}
            </Button>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Grievances ---------- */
function GrievancesSection({ candidate, myGrievances }) {
  const { db, commitOnChain } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Application Issue', subject: '', description: '' });

  const submit = () => {
    if (!form.subject || !form.description) {
      toast.error('Please fill subject and description');
      return;
    }
    const id = `GRV-${(db.grievances.length + 1).toString().padStart(4, '0')}`;
    commitOnChain({
      entity: 'Grievance',
      action: `Lodged (${id})`,
      performedBy: candidate.email,
      mutate: (prev) => ({
        ...prev,
        grievances: [{
          id, type: form.type, subject: form.subject,
          candidateId: candidate.id, candidateName: `${candidate.firstName} ${candidate.lastName}`,
          priority: 'Medium', status: 'Open',
          assignedTo: 'grievance.officer@esic.gov.in',
          raisedAt: new Date().toISOString(),
          sla: 7,
        }, ...prev.grievances],
      }),
    });
    toast.success(`Grievance ${id} lodged — assigned to officer`);
    setOpen(false);
    setForm({ type: 'Application Issue', subject: '', description: '' });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-base font-semibold">My Grievances</h3>
          <p className="text-xs text-muted-foreground">Lodge & track concerns with SLA-backed resolution.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="lodge-grievance-btn">
              <Plus className="h-4 w-4 mr-1.5" /> Lodge Grievance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lodge a new grievance</DialogTitle>
              <DialogDescription>Your grievance will be hashed on-chain and routed to the relevant officer.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger data-testid="grievance-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Application Issue', 'Result Discrepancy', 'Document Verification', 'Admit Card', 'Reservation', 'Fee Refund'].map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject" data-testid="grievance-subject" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail" data-testid="grievance-description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} data-testid="grievance-submit">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {myGrievances.length === 0 ? (
        <EmptyState title="No grievances yet" description="You haven't raised any grievances. Use the button above to lodge one." />
      ) : (
        <Card className="divide-y divide-border">
          {myGrievances.map(g => (
            <div key={g.id} className="p-4 flex items-start gap-3" data-testid={`grievance-row-${g.id}`}>
              <div className={cn('h-9 w-9 rounded-md flex items-center justify-center shrink-0',
                g.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                g.priority === 'Medium' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'
              )}>
                <FlagTriangleRight className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{g.subject}</p>
                  <span className="text-[10px] font-mono text-muted-foreground">{g.id}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{g.type} · Priority: {g.priority} · Raised {new Date(g.raisedAt).toLocaleDateString()} · SLA {g.sla} days</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
