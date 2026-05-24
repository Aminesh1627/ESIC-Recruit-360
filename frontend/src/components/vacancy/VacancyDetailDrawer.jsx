import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BlockchainTimeline } from '@/components/shared/BlockchainTimeline';
import {
  Briefcase, MapPin, Users2, Calendar, Building2, Coins, Layers, FileText,
  CheckCircle2, XCircle, Clock, AlertCircle, Download, Hash, Send
} from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function StatRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && (
        <div className="h-8 w-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground mt-0.5 break-words">{value || '—'}</div>
      </div>
    </div>
  );
}

const NEXT_STATUS = {
  'Draft': 'Submitted',
  'Submitted': 'Under Review',
  'Under Review': 'Finance Review',
  'Finance Review': 'Reservation Review',
  'Reservation Review': 'Approved',
  'Approved': 'Published',
  'Published': 'Closed',
};

export function VacancyDetailDrawer({ open, onOpenChange, vacancy }) {
  const { t } = useLang();
  const { updateVacancyStatus, db } = useStore();
  const [confirm, setConfirm] = useState(null); // { type, label }
  const [comment, setComment] = useState('');

  if (!vacancy) return null;

  const relatedEvents = db.blockchain.filter(b => (b.action || '').includes(vacancy.id) || b.entity === 'Vacancy').slice(0, 8);

  const doApprove = () => {
    const next = NEXT_STATUS[vacancy.status] || 'Approved';
    updateVacancyStatus(vacancy.id, next, comment);
    toast.success(`Vacancy ${vacancy.id} → ${next}`);
    setConfirm(null);
    setComment('');
    onOpenChange(false);
  };

  const doReject = () => {
    updateVacancyStatus(vacancy.id, 'Closed', comment);
    toast.error(`Vacancy ${vacancy.id} rejected`);
    setConfirm(null);
    setComment('');
    onOpenChange(false);
  };

  const doSendBack = () => {
    updateVacancyStatus(vacancy.id, 'Draft', comment);
    toast.info(`Vacancy ${vacancy.id} sent back for revision`);
    setConfirm(null);
    setComment('');
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[860px] p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SheetTitle className="font-display text-xl font-semibold tracking-tight truncate">
                    {vacancy.postName}
                  </SheetTitle>
                  <StatusBadge status={vacancy.status} />
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {vacancy.id} · {vacancy.postCode} · Group {vacancy.group} · {vacancy.cadre}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('PDF exported (mock)')}>
                <Download className="h-4 w-4 mr-1.5" />
                PDF
              </Button>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-4 justify-start bg-muted/50 overflow-x-auto scrollbar-thin">
              <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
              <TabsTrigger value="reservation">{t('reservation')}</TabsTrigger>
              <TabsTrigger value="qualification">{t('qualification')}</TabsTrigger>
              <TabsTrigger value="experience">{t('experience')}</TabsTrigger>
              <TabsTrigger value="approvals">{t('approvals')}</TabsTrigger>
              <TabsTrigger value="documents">{t('documents')}</TabsTrigger>
              <TabsTrigger value="audit">{t('audit')}</TabsTrigger>
              <TabsTrigger value="blockchain">{t('blockchain')}</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Card className="p-4 divide-y divide-border">
                    <StatRow label="Department" value={vacancy.department} icon={Building2} />
                    <StatRow label="Location" value={vacancy.location} icon={MapPin} />
                    <StatRow label="Pay Matrix" value={`${vacancy.payMatrix}  ·  ${vacancy.payScale}`} icon={Coins} />
                    <StatRow label="Recruitment Type" value={vacancy.recruitmentType} icon={Briefcase} />
                  </Card>
                  <Card className="p-4 divide-y divide-border">
                    <StatRow label="Total Vacancies" value={vacancy.totalVacancies} icon={Users2} />
                    <StatRow label="Roster Point" value={vacancy.rosterPoint} icon={Layers} />
                    <StatRow label="Age Limit" value={`${vacancy.ageLimit} yrs · ${vacancy.ageRelaxation}`} icon={Calendar} />
                    <StatRow label="Selection Stages" value={vacancy.selectionStages.join(' → ')} icon={CheckCircle2} />
                  </Card>
                </div>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1.5">Job Description</div>
                  <p className="text-sm text-foreground leading-relaxed">{vacancy.jobDescription}</p>
                </Card>
              </TabsContent>

              <TabsContent value="reservation" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium">Reservation Matrix</div>
                      <div className="text-xs text-muted-foreground">As per DOPT roster guidelines</div>
                    </div>
                    {vacancy.backlog && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning-soft text-warning px-2 py-0.5 text-[11px] font-medium">
                        <AlertCircle className="h-3 w-3" /> Includes Backlog
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(vacancy.reservation).map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-border p-3 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                        <div className="font-display text-xl font-semibold mt-1">{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">Reservation Notes</div>
                  <ul className="text-sm space-y-1.5">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Category split aligns with 200-point roster.</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> EWS share validated against income certificate norms.</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Carry-forward applied for unfilled SC/ST seats.</li>
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="qualification" className="mt-0 space-y-3">
                <Card className="p-4 divide-y divide-border">
                  <StatRow label="Essential Education" value={vacancy.qualification} icon={FileText} />
                  <StatRow label="Certification" value={vacancy.certificationReq} icon={CheckCircle2} />
                  <StatRow label="Preferred Skills" value="Service Rules · MS Office · Govt. Communication · Data Privacy" icon={Layers} />
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="mt-0 space-y-3">
                <Card className="p-4 divide-y divide-border">
                  <StatRow label="Min / Max Experience" value={`${vacancy.experience.min} – ${vacancy.experience.max} years`} icon={Clock} />
                  <StatRow label="Domain" value={`${vacancy.department} / Public Sector experience preferred`} icon={Briefcase} />
                  <StatRow label="Service Rules" value="ESIC (Officers and Staff) Recruitment Rules, 2015 (as amended)" icon={FileText} />
                </Card>
              </TabsContent>

              <TabsContent value="approvals" className="mt-0 space-y-3">
                <Card className="p-0 overflow-hidden">
                  <ul className="divide-y divide-border">
                    {vacancy.approvals.map((ap, idx) => (
                      <li key={idx} className="p-4 flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0
                          ${ap.status === 'Approved' ? 'bg-success-soft text-success' :
                            ap.status === 'In Review' ? 'bg-warning-soft text-warning' :
                            'bg-muted text-muted-foreground'}`}>
                          {ap.status === 'Approved' ? <CheckCircle2 className="h-4 w-4" /> :
                           ap.status === 'In Review' ? <Clock className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{ap.stage}</div>
                            <StatusBadge status={ap.status === 'Approved' ? 'Approved' : ap.status === 'In Review' ? 'Under Review' : 'Pending'} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ap.by} · {new Date(ap.at).toLocaleString()}
                          </div>
                          <div className="text-sm mt-1.5 text-foreground/80">{ap.comment}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">Supporting Documents</div>
                  <ul className="divide-y divide-border">
                    {['Vacancy Justification Note.pdf', 'Reservation Matrix Workings.xlsx', 'Govt. Order O.M. No. F-12018.pdf', 'Budget Approval Memo.pdf'].map(d => (
                      <li key={d} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{d}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toast.success('Downloaded (mock)')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">Audit Trail</div>
                  <ul className="space-y-3">
                    <li className="text-sm"><span className="font-medium">{vacancy.createdBy}</span> created vacancy on <span className="text-muted-foreground">{new Date(vacancy.createdAt).toLocaleString()}</span></li>
                    {vacancy.approvals.filter(a => a.status === 'Approved').map((a, i) => (
                      <li key={i} className="text-sm"><span className="font-medium">{a.by}</span> approved at <span className="text-muted-foreground">{new Date(a.at).toLocaleString()}</span> – <em>"{a.comment}"</em></li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="mt-0 space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium">On-chain Record</div>
                      <div className="text-xs text-muted-foreground">All status transitions are cryptographically signed</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2 py-0.5 text-[11px] font-medium border border-success/30">
                      <Hash className="h-3 w-3" /> Hash valid
                    </span>
                  </div>
                  <BlockchainTimeline events={relatedEvents} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Sticky Action Bar */}
          <div className="border-t border-border px-6 py-3 bg-card flex flex-wrap items-center gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirm({ type: 'sendback', label: 'Send Back' })}>{t('sendBack')}</Button>
            <Button variant="outline" onClick={() => setConfirm({ type: 'clarify', label: 'Request Clarification' })}>{t('requestClarification')}</Button>
            <Button variant="destructive" onClick={() => setConfirm({ type: 'reject', label: 'Reject' })}>
              <XCircle className="h-4 w-4 mr-1.5" />{t('reject')}
            </Button>
            <Button onClick={() => setConfirm({ type: 'approve', label: NEXT_STATUS[vacancy.status] || 'Approve' })} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {t('approve')} {NEXT_STATUS[vacancy.status] ? `→ ${NEXT_STATUS[vacancy.status]}` : ''}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmAction')}: {confirm?.label}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground mb-3">{t('addComment')}</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Decision rationale, file references, observations…"
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>{t('cancel')}</Button>
            <Button
              disabled={!comment.trim()}
              onClick={() => {
                if (confirm.type === 'approve') doApprove();
                else if (confirm.type === 'reject') doReject();
                else if (confirm.type === 'sendback') doSendBack();
                else { toast.info('Clarification requested'); setConfirm(null); setComment(''); onOpenChange(false); }
              }}
              className={confirm?.type === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Confirm & Sign on-chain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
