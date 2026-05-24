import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BlockchainTimeline } from '@/components/shared/BlockchainTimeline';
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, FileCheck2,
  TrendingUp, ShieldCheck, Download, Calendar, Building2, CheckCircle2,
  XCircle, Send, Hash, AlertCircle, Sparkles
} from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

function Metric({ label, value, hint, tone = 'primary' }) {
  const tones = {
    primary: 'text-primary', secondary: 'text-secondary', accent: 'text-accent-foreground',
    success: 'text-success', warning: 'text-warning', destructive: 'text-destructive'
  };
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className={`font-display text-xl font-semibold mt-1 ${tones[tone]}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

export function CandidateDetailDrawer({ open, onOpenChange, candidate, application }) {
  const { t } = useLang();
  const { updateApplicationStatus, db } = useStore();
  const [confirm, setConfirm] = useState(null);
  const [comment, setComment] = useState('');

  const salaryData = useMemo(() => (candidate?.experience || []).map((e, i) => ({
    point: `Job ${i + 1}`, salary: e.salary, company: e.company,
  })), [candidate]);

  if (!candidate) return null;

  const relatedEvents = db.blockchain.filter(b => b.entity === 'Application' || b.entity === 'Document').slice(0, 8);

  const doStatus = (status) => {
    if (application) updateApplicationStatus(application.id, status);
    toast.success(`Application status → ${status}`);
    setConfirm(null);
    setComment('');
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[900px] p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border px-6 py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-accent/30">
                <AvatarImage src={candidate.photo} />
                <AvatarFallback>{candidate.firstName?.[0]}{candidate.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <SheetTitle className="font-display text-xl font-semibold tracking-tight">
                  {candidate.firstName} {candidate.lastName}
                </SheetTitle>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {candidate.id} · Application {application?.id || '—'} · {candidate.category} · {candidate.gender}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {application?.status && <StatusBadge status={application.status} />}
                  {candidate.pwd && <span className="rounded-full border border-pending/30 bg-pending-soft text-pending text-[11px] px-2 py-0.5 font-medium">PwD</span>}
                  {candidate.exServiceman && <span className="rounded-full border border-accent/30 bg-accent-soft text-accent-foreground text-[11px] px-2 py-0.5 font-medium">Ex-Serviceman</span>}
                  <span className="rounded-full border border-secondary/30 bg-secondary-soft text-secondary text-[11px] px-2 py-0.5 font-medium">
                    {candidate.profileCompleteness}% profile
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Profile PDF generated (mock)')}>
                <Download className="h-4 w-4 mr-1.5" /> PDF
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              <Metric label={t('totalExperience')} value={`${candidate.totalExperience}y`} tone="primary" />
              <Metric label={t('relevantExperience')} value={`${candidate.relevantExperience}y`} tone="secondary" />
              <Metric label={t('switchCount')} value={candidate.switchCount} tone="warning" />
              <Metric label={t('avgTenure')} value={`${candidate.avgTenure}y`} tone="accent" />
              <Metric label="CBT Score" value={application?.cbtScore || '—'} tone="success" />
            </div>
          </SheetHeader>

          <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-4 justify-start bg-muted/50 overflow-x-auto scrollbar-thin">
              <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
              <TabsTrigger value="education">{t('education')}</TabsTrigger>
              <TabsTrigger value="experience">{t('experience')}</TabsTrigger>
              <TabsTrigger value="certification">{t('certifications')}</TabsTrigger>
              <TabsTrigger value="documents">{t('documents')}</TabsTrigger>
              <TabsTrigger value="eligibility">{t('eligibility')}</TabsTrigger>
              <TabsTrigger value="audit">{t('audit')}</TabsTrigger>
              <TabsTrigger value="blockchain">{t('blockchain')}</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
              <TabsContent value="profile" className="mt-0 space-y-3">
                <Card className="p-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Row icon={Mail} label="Email" value={candidate.email} />
                  <Row icon={Phone} label="Mobile" value={candidate.mobile} />
                  <Row icon={Calendar} label="DOB" value={candidate.dob} />
                  <Row icon={ShieldCheck} label="Identity" value={`${candidate.identityType} · ${candidate.identityNumber}`} />
                  <Row icon={MapPin} label="Address" value={`${candidate.address}, ${candidate.district}, ${candidate.state} – ${candidate.pincode}`} />
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">{t('profileCompleteness')}</div>
                  <Progress value={candidate.profileCompleteness} className="h-2" />
                  <div className="mt-1.5 text-xs text-muted-foreground">{candidate.profileCompleteness}% complete</div>
                </Card>
              </TabsContent>

              <TabsContent value="education" className="mt-0 space-y-3">
                {candidate.education.map((e, i) => (
                  <Card key={i} className="p-4 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{e.degree}</div>
                      <div className="text-xs text-muted-foreground">{e.institute} · {e.year}</div>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs">
                        <span className="rounded-full border border-success/30 bg-success-soft text-success px-2 py-0.5 font-medium">{e.percent}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="experience" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium">{t('salaryProgression')}</div>
                      <div className="text-xs text-muted-foreground">In LPA, across {candidate.experience.length} roles</div>
                    </div>
                  </div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salaryData} margin={{ left: -20, top: 5, right: 10, bottom: 0 }}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                        <XAxis dataKey="point" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="salary" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {candidate.experience.map((e, i) => (
                  <Card key={i} className="p-4 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-secondary-soft text-secondary flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-medium text-sm">{e.designation} · {e.company}</div>
                        <span className="text-xs font-medium text-foreground">₹{e.salary} LPA</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{e.startDate} → {e.endDate}</div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="certification" className="mt-0 space-y-3">
                {candidate.certifications.length === 0 ? (
                  <Card className="p-6 text-sm text-muted-foreground text-center">No certifications uploaded.</Card>
                ) : candidate.certifications.map((c, i) => (
                  <Card key={i} className="p-4 flex items-center gap-3">
                    <Award className="h-5 w-5 text-accent-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.issuer} · Valid till {c.validity}</div>
                    </div>
                    <StatusBadge status={c.verified ? 'Verified' : 'Pending'} />
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-2">
                {candidate.documents.map((d, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="h-5 w-5 text-primary" />
                      <div className="text-sm font-medium">{d.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} />
                      <Button variant="ghost" size="sm" onClick={() => toast.success('Opened in viewer (mock)')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="eligibility" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-3">Auto Eligibility Engine</div>
                  <ul className="space-y-2.5">
                    {[
                      { key: 'Age Match', ok: application?.eligibility?.age ?? true },
                      { key: 'Qualification Match', ok: application?.eligibility?.qualification ?? true },
                      { key: 'Experience Match', ok: application?.eligibility?.experience ?? true },
                      { key: 'Reservation Match', ok: application?.eligibility?.reservation ?? true },
                    ].map(item => (
                      <li key={item.key} className="flex items-center gap-2.5">
                        {item.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm font-medium">{item.key}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{item.ok ? 'Verified by rule engine' : 'Below threshold'}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent-foreground" />
                      <span className="text-sm font-medium">Overall Status</span>
                    </div>
                    <StatusBadge status={application?.status || 'Eligible'} />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-3">
                <Card className="p-4">
                  <ul className="space-y-3 text-sm">
                    <li><span className="font-medium">{candidate.email}</span> registered profile · <span className="text-muted-foreground">{candidate.dob}</span></li>
                    <li><span className="font-medium">screening.officer@esic</span> reviewed application · <span className="text-muted-foreground">2 days ago</span></li>
                    <li><span className="font-medium">dv.officer@esic</span> verified Photo & Signature · <span className="text-muted-foreground">1 day ago</span></li>
                    <li><span className="font-medium">interview.panel.6</span> assigned to candidate · <span className="text-muted-foreground">5 hours ago</span></li>
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="mt-0">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">On-chain Verifications</div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2 py-0.5 text-[11px] font-medium border border-success/30">
                      <Hash className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <BlockchainTimeline events={relatedEvents} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t border-border px-6 py-3 bg-card flex flex-wrap items-center gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirm({ type: 'override', label: 'Override Decision' })}>
              <AlertCircle className="h-4 w-4 mr-1.5" /> Override
            </Button>
            <Button variant="outline" onClick={() => setConfirm({ type: 'clarify', label: 'Seek Clarification' })}>
              {t('requestClarification')}
            </Button>
            <Button variant="destructive" onClick={() => setConfirm({ type: 'reject', label: 'Reject' })}>
              <XCircle className="h-4 w-4 mr-1.5" /> {t('reject')}
            </Button>
            <Button onClick={() => setConfirm({ type: 'approve', label: 'Approve & Shortlist' })} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> {t('approve')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('confirmAction')}: {confirm?.label}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t('addComment')}</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Comments…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>{t('cancel')}</Button>
            <Button
              disabled={!comment.trim()}
              onClick={() => {
                if (confirm.type === 'approve') doStatus('Shortlisted');
                else if (confirm.type === 'reject') doStatus('Rejected');
                else { toast.info('Comment recorded'); setConfirm(null); setComment(''); onOpenChange(false); }
              }}
            >
              <Send className="h-4 w-4 mr-1.5" /> Confirm & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}
