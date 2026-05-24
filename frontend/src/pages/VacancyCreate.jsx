import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Send, FileText, Upload, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function VacancyCreate() {
  const { addVacancy } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    postName: '', postCode: '', group: 'B', cadre: 'Direct Recruitment',
    department: 'ESIC HQ', payMatrix: 'Level-7', payScale: '₹44,900 – ₹1,42,400',
    recruitmentType: 'Direct Recruitment',
    totalVacancies: 4, reservation: { UR: 2, OBC: 1, SC: 1, ST: 0, EWS: 0 },
    rosterPoint: 'RP-201', backlog: false,
    location: 'New Delhi',
    ageLimit: 30, ageRelaxation: 'As per Govt Rules',
    experience: { min: 2, max: 8 },
    qualification: 'B.Tech / Equivalent',
    certificationReq: '—',
    selectionStages: ['CBT', 'DV', 'Interview'],
    jobDescription: '',
    remarks: '',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (status = 'Draft') => {
    if (!form.postName.trim()) { toast.error('Post name is required'); return; }
    addVacancy({ ...form, status });
    toast.success(`Vacancy ${status === 'Draft' ? 'saved as draft' : 'submitted for approval'}`);
    navigate('/vacancies');
  };

  return (
    <div>
      <PageHeader
        title={t('createVacancy')}
        subtitle="Define the full vacancy specification · all fields will be cryptographically signed on submission"
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/vacancies')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            <Button variant="outline" onClick={() => handleSave('Draft')}>
              <Save className="h-4 w-4 mr-1.5" /> {t('saveDraft')}
            </Button>
            <Button onClick={() => handleSave('Submitted')}>
              <Send className="h-4 w-4 mr-1.5" /> {t('submit')}
            </Button>
          </>
        }
      />

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="reservation">Reservation & Eligibility</TabsTrigger>
          <TabsTrigger value="job">Job Description</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-4">Post Identification</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('postName')} required>
                <Input value={form.postName} onChange={(e) => update('postName', e.target.value)} placeholder="Assistant Director (IT)" />
              </Field>
              <Field label={t('postCode')}>
                <Input value={form.postCode} onChange={(e) => update('postCode', e.target.value)} placeholder="AD-IT" />
              </Field>
              <Field label={t('group')}>
                <Select value={form.group} onValueChange={(v) => update('group', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['A', 'B', 'C'].map(g => <SelectItem key={g} value={g}>Group {g}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={t('cadre')}>
                <Select value={form.cadre} onValueChange={(v) => update('cadre', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Direct Recruitment', 'Promotion', 'Deputation', 'Contract'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('department')}>
                <Select value={form.department} onValueChange={(v) => update('department', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['ESIC HQ', 'Medical Division', 'Revenue', 'IT Division', 'HR & Administration', 'Finance', 'Vigilance'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('location')}>
                <Select value={form.location} onValueChange={(v) => update('location', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bengaluru', 'Hyderabad'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Separator className="my-6" />
            <h3 className="font-display text-base font-semibold mb-4">Pay & Position</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('payMatrix')}><Input value={form.payMatrix} onChange={(e) => update('payMatrix', e.target.value)} /></Field>
              <Field label={t('payScale')}><Input value={form.payScale} onChange={(e) => update('payScale', e.target.value)} /></Field>
              <Field label={t('numberOfVacancies')}><Input type="number" value={form.totalVacancies} onChange={(e) => update('totalVacancies', +e.target.value)} /></Field>
              <Field label={t('rosterPoint')}><Input value={form.rosterPoint} onChange={(e) => update('rosterPoint', e.target.value)} /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reservation">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold">{t('reservationMatrix')}</h3>
              <div className="flex items-center gap-2">
                <Label className="text-sm">{t('backlog')}</Label>
                <Switch checked={form.backlog} onCheckedChange={(v) => update('backlog', v)} />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(form.reservation).map(([k, v]) => (
                <div key={k}>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</Label>
                  <Input
                    type="number"
                    value={v}
                    className="mt-1 text-center"
                    onChange={(e) => update('reservation', { ...form.reservation, [k]: +e.target.value })}
                  />
                </div>
              ))}
            </div>

            <Separator className="my-6" />
            <h3 className="font-display text-base font-semibold mb-4">Eligibility Criteria</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('ageLimit')}><Input type="number" value={form.ageLimit} onChange={(e) => update('ageLimit', +e.target.value)} /></Field>
              <Field label={t('ageRelaxation')}><Input value={form.ageRelaxation} onChange={(e) => update('ageRelaxation', e.target.value)} /></Field>
              <Field label="Minimum Experience (years)">
                <Input type="number" value={form.experience.min} onChange={(e) => update('experience', { ...form.experience, min: +e.target.value })} />
              </Field>
              <Field label="Maximum Experience (years)">
                <Input type="number" value={form.experience.max} onChange={(e) => update('experience', { ...form.experience, max: +e.target.value })} />
              </Field>
              <Field label={t('qualification')} className="sm:col-span-2">
                <Input value={form.qualification} onChange={(e) => update('qualification', e.target.value)} />
              </Field>
              <Field label={t('certificationReq')} className="sm:col-span-2">
                <Input value={form.certificationReq} onChange={(e) => update('certificationReq', e.target.value)} />
              </Field>
            </div>

            <Separator className="my-6" />
            <h3 className="font-display text-base font-semibold mb-3">{t('selectionStages')}</h3>
            <div className="flex flex-wrap gap-2">
              {['CBT', 'Skill Test', 'Typing Test', 'DV', 'Interview', 'Medical'].map(s => {
                const on = form.selectionStages.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => update('selectionStages', on ? form.selectionStages.filter(x => x !== s) : [...form.selectionStages, s])}
                    className={`text-xs font-medium rounded-full border px-3 py-1.5 transition-colors ${on ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}
                  >
                    {on ? '✓ ' : '+ '}{s}
                  </button>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="job">
          <Card className="p-6 space-y-4">
            <Field label={t('jobDescription')}>
              <Textarea
                value={form.jobDescription}
                onChange={(e) => update('jobDescription', e.target.value)}
                rows={8}
                placeholder="Define key responsibilities, reporting lines, departmental KRAs, expected outcomes…"
              />
            </Field>
            <Field label={t('remarks')}>
              <Textarea value={form.remarks} onChange={(e) => update('remarks', e.target.value)} rows={3} placeholder="Internal remarks for approvers" />
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card className="p-6">
            <div className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/40 transition-colors cursor-pointer" onClick={() => toast.success('Mock file uploaded')}>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Drop files or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Justification notes · Government Orders · Budget memos</p>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {['Vacancy Justification Note.pdf', 'Reservation Workings.xlsx', 'O.M. F-12018.pdf'].map(f => (
                <li key={f} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">{f}</span>
                  </div>
                  <Button variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium text-foreground">{label} {required && <span className="text-destructive">*</span>}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
