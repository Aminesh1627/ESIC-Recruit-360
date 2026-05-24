import React, { useState } from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Cog, Globe, Shield, Workflow, Database, Users2, Languages,
  Boxes, BookOpen, Server, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const INTEGRATIONS = [
  { name: 'Aadhaar API', tag: 'KYC', status: 'Connected', url: 'https://api.uidai.gov.in/v1/verify', tone: 'success' },
  { name: 'DigiLocker', tag: 'Documents', status: 'Connected', url: 'https://api.digitallocker.gov.in', tone: 'success' },
  { name: 'CBT Vendor (TCS iON)', tag: 'Exam', status: 'Pending', url: 'https://api.tcsion.com/cbt/v2', tone: 'warning' },
  { name: 'NPCI Payment Gateway', tag: 'Payment', status: 'Connected', url: 'https://api.npci.org.in/upi', tone: 'success' },
  { name: 'GupShup SMS', tag: 'SMS', status: 'Connected', url: 'https://api.gupshup.io', tone: 'success' },
  { name: 'AWS SES', tag: 'Email', status: 'Connected', url: 'smtp.amazonaws.com', tone: 'success' },
  { name: 'ESIC HRMS', tag: 'HRMS', status: 'Connected', url: 'https://hrms.esic.in/api', tone: 'success' },
  { name: 'Panchdeep Portal', tag: 'Mapping', status: 'Pending', url: 'https://panchdeep.esic.in/api', tone: 'warning' },
];

export default function SuperAdminPage() {
  const { t } = useLang();
  const [tab, setTab] = useState('config');

  return (
    <div>
      <PageHeader title={t('systemConfig')} subtitle="Complete system configuration center for ESIC Recruit360" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Roles" value="14" icon={Users2} tone="primary" />
        <KpiCard label="Integrations" value="8/10 active" icon={Boxes} tone="secondary" />
        <KpiCard label="Workflows" value="23" icon={Workflow} tone="accent" />
        <KpiCard label="Languages" value="3" icon={Languages} tone="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 overflow-x-auto justify-start">
          <TabsTrigger value="config">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="workflow">Workflows</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="master">Master Data</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="api">API Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-4">General Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <SettingItem label="Organization Name" defaultValue="Employees' State Insurance Corporation" />
              <SettingItem label="Default Language" select={['English', 'தமிழ்', 'हिन्दी']} />
              <SettingItem label="Default Timezone" defaultValue="Asia/Kolkata (IST)" />
              <SettingItem label="Financial Year" defaultValue="2025-26" />
            </div>
            <Separator className="my-5" />
            <h3 className="font-display text-base font-semibold mb-3">Toggle Settings</h3>
            {[
              { label: 'Two-factor authentication for all officers', def: true },
              { label: 'Auto-publish merit lists after Competent Authority approval', def: false },
              { label: 'Allow candidate re-applications within 30 days', def: true },
              { label: 'Auto-blockchain signing of all status transitions', def: true },
              { label: 'AI-based fraud detection on document uploads', def: true },
            ].map(s => (
              <div key={s.label} className="py-3 flex items-center justify-between border-b border-border last:border-b-0">
                <span className="text-sm">{s.label}</span>
                <Switch defaultChecked={s.def} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {INTEGRATIONS.map(i => (
              <Card key={i.name} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-display text-base font-semibold">{i.name}</div>
                      <Badge variant="outline" className="text-[10px]">{i.tag}</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground mt-1 font-mono block">{i.url}</code>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 border ${i.tone === 'success' ? 'bg-success-soft text-success border-success/30' : 'bg-warning-soft text-warning border-warning/30'}`}>
                    {i.tone === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {i.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Input placeholder="Client ID" defaultValue={`esic_${i.tag.toLowerCase()}_id_*****`} />
                  <Input placeholder="Secret" type="password" defaultValue="••••••••••••" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success('Connection test successful')}>Test Connection</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Configuration saved')}>Save</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-semibold">Vacancy Approval Workflow</h3>
                <p className="text-xs text-muted-foreground">Drag-and-drop designer (visual representation)</p>
              </div>
              <Button variant="outline" onClick={() => toast.success('Workflow saved')}>Save Workflow</Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2">
              {['Create', 'Submit', 'Dept. Head', 'Finance', 'Reservation Cell', 'Competent Authority', 'Publish'].map((s, i, a) => (
                <React.Fragment key={s}>
                  <div className="rounded-lg border border-primary/30 bg-primary-soft text-primary px-4 py-3 text-sm font-medium whitespace-nowrap">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Step {i + 1}</div>
                    {s}
                  </div>
                  {i < a.length - 1 && <div className="h-px w-6 bg-border" />}
                </React.Fragment>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-3">14 System Roles · Permissions Matrix</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Candidate', 'Recruitment Administrator', 'Establishment Officer', 'Department Head',
                'HR Officer', 'Reservation Cell Officer', 'Finance Officer', 'Screening Officer',
                'DV Officer', 'Interview Panel Member', 'Grievance Officer', 'Competent Authority',
                'Regional Director', 'Super Admin',
              ].map(r => (
                <div key={r} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-primary-soft text-primary flex items-center justify-center"><Shield className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">{r}</span>
                  </div>
                  <Button variant="ghost" size="sm">Configure</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="master" className="mt-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-3">Master Data Categories</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {['Pay Matrix Levels', 'Departments', 'Locations', 'Cadres', 'Categories', 'Identity Types', 'Document Types', 'States & Districts', 'Selection Stages'].map(c => (
                <Card key={c} className="p-4 hover:border-primary cursor-pointer transition-colors">
                  <Database className="h-5 w-5 text-primary mb-2" />
                  <div className="font-medium text-sm">{c}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Manage values</div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="mt-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-2">Translation Management</h3>
            <p className="text-xs text-muted-foreground mb-4">All UI strings synchronized across 3 languages. Switch instantly from topbar.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { lang: 'English', count: 130, completeness: 100 },
                { lang: 'தமிழ் (Tamil)', count: 130, completeness: 100 },
                { lang: 'हिन्दी (Hindi)', count: 130, completeness: 100 },
              ].map(l => (
                <Card key={l.lang} className="p-4">
                  <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><span className="font-medium text-sm">{l.lang}</span></div>
                  <div className="mt-3 text-xs text-muted-foreground">{l.count} keys translated</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-success" style={{ width: `${l.completeness}%` }} />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="mt-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-2">Blockchain Simulator</h3>
            <p className="text-xs text-muted-foreground mb-4">Configure ledger behaviour & view live block stream.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <SettingItem label="Network" defaultValue="esic-private-chain" />
              <SettingItem label="Consensus" select={['PoA', 'IBFT', 'Raft']} />
              <SettingItem label="Block Interval" defaultValue="6s" />
            </div>
            <div className="mt-4">
              <Link to="/audit" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                View live ledger <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold mb-3">API Catalog</h3>
            <ul className="divide-y divide-border">
              {[
                { method: 'POST', path: '/api/integration/aadhaar/verify' },
                { method: 'POST', path: '/api/cbt/results/import' },
                { method: 'POST', path: '/api/hrms/employee/create' },
                { method: 'GET',  path: '/api/digilocker/documents/:candidateId' },
                { method: 'POST', path: '/api/notification/sms/send' },
                { method: 'POST', path: '/api/blockchain/sign' },
              ].map(a => (
                <li key={a.path} className="py-3 flex items-center gap-3">
                  <Badge className={`font-mono ${a.method === 'POST' ? 'bg-primary' : 'bg-secondary'}`}>{a.method}</Badge>
                  <code className="text-xs font-mono flex-1">{a.path}</code>
                  <Button variant="ghost" size="sm">Try</Button>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingItem({ label, defaultValue, select }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      {select ? (
        <Select defaultValue={select[0]}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>{select.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      ) : (
        <Input className="mt-1.5" defaultValue={defaultValue} />
      )}
    </div>
  );
}
