import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Cog, Globe, Shield, Workflow, Database, Users2, Languages,
  Boxes, CheckCircle2, XCircle, Sparkles, Plus, Trash2, Edit3,
  ArrowRight, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const TAB_BY_SECTION = {
  undefined: 'config',
  config: 'config',
  integrations: 'integrations',
  workflow: 'workflow',
  roles: 'roles',
  'master-data': 'master',
  translations: 'translations',
  blockchain: 'blockchain',
  'api-catalog': 'api',
};
const SECTION_BY_TAB = Object.fromEntries(Object.entries(TAB_BY_SECTION).map(([k, v]) => [v, k]));

const INTEGRATIONS_SEED = [
  { name: 'Aadhaar API', tag: 'KYC', status: 'Connected', url: 'https://api.uidai.gov.in/v1/verify', tone: 'success' },
  { name: 'DigiLocker', tag: 'Documents', status: 'Connected', url: 'https://api.digitallocker.gov.in', tone: 'success' },
  { name: 'CBT Vendor (TCS iON)', tag: 'Exam', status: 'Pending', url: 'https://api.tcsion.com/cbt/v2', tone: 'warning' },
  { name: 'NPCI Payment Gateway', tag: 'Payment', status: 'Connected', url: 'https://api.npci.org.in/upi', tone: 'success' },
  { name: 'GupShup SMS', tag: 'SMS', status: 'Connected', url: 'https://api.gupshup.io', tone: 'success' },
  { name: 'AWS SES', tag: 'Email', status: 'Connected', url: 'smtp.amazonaws.com', tone: 'success' },
  { name: 'ESIC HRMS', tag: 'HRMS', status: 'Connected', url: 'https://hrms.esic.in/api', tone: 'success' },
  { name: 'Panchdeep Portal', tag: 'Mapping', status: 'Pending', url: 'https://panchdeep.esic.in/api', tone: 'warning' },
];

const ALL_PERMS = ['view', 'create', 'approve', 'reject', 'publish', 'audit', 'export', 'configure'];

export default function SuperAdminPage() {
  const { t } = useLang();
  const { section } = useParams();
  const navigate = useNavigate();
  const { db } = useStore();
  const tab = TAB_BY_SECTION[section] || 'config';

  const setTab = (v) => {
    const s = SECTION_BY_TAB[v];
    navigate(s === 'config' || !s ? '/admin' : `/admin/${s === undefined ? 'config' : s}`);
  };

  return (
    <div>
      <PageHeader title={t('systemConfig')} subtitle="Complete system configuration center for ESIC Recruit360" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Roles" value={db.roles?.length || 14} icon={Users2} tone="primary" />
        <KpiCard label="Integrations" value="8/10 active" icon={Boxes} tone="secondary" />
        <KpiCard label="Workflows" value={db.workflows?.length || 0} icon={Workflow} tone="accent" />
        <KpiCard label="Languages" value="3" icon={Languages} tone="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 overflow-x-auto justify-start flex-wrap h-auto" data-testid="superadmin-tabs">
          <TabsTrigger value="config" data-testid="sa-tab-config">General</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="sa-tab-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="workflow" data-testid="sa-tab-workflow">Workflows</TabsTrigger>
          <TabsTrigger value="roles" data-testid="sa-tab-roles">Roles</TabsTrigger>
          <TabsTrigger value="master" data-testid="sa-tab-master">Master Data</TabsTrigger>
          <TabsTrigger value="translations" data-testid="sa-tab-translations">Translations</TabsTrigger>
          <TabsTrigger value="blockchain" data-testid="sa-tab-blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="api" data-testid="sa-tab-api">API Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4 space-y-4"><GeneralTab /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab /></TabsContent>
        <TabsContent value="workflow" className="mt-4"><WorkflowsTab /></TabsContent>
        <TabsContent value="roles" className="mt-4"><RolesTab /></TabsContent>
        <TabsContent value="master" className="mt-4"><MasterDataTab /></TabsContent>
        <TabsContent value="translations" className="mt-4"><TranslationsTab /></TabsContent>
        <TabsContent value="blockchain" className="mt-4"><BlockchainTab /></TabsContent>
        <TabsContent value="api" className="mt-4"><ApiCatalogTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- General ---------- */
function GeneralTab() {
  return (
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
          <Switch defaultChecked={s.def} data-testid={`toggle-${s.label.slice(0, 20).replace(/\s/g, '-')}`} />
        </div>
      ))}
      <div className="pt-4 flex justify-end">
        <Button onClick={() => toast.success('General settings saved')} data-testid="save-general"><CheckCircle2 className="h-4 w-4 mr-1.5" /> Save Changes</Button>
      </div>
    </Card>
  );
}

/* ---------- Integrations ---------- */
function IntegrationsTab() {
  const { commitOnChain } = useStore();
  const [list, setList] = useState(INTEGRATIONS_SEED);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(null);

  const onAdd = (data) => {
    setList(prev => [{ ...data, status: 'Pending', tone: 'warning' }, ...prev]);
    commitOnChain({ entity: 'Integration', action: `Added (${data.name})` });
    setAdd(false);
  };
  const onTest = (i) => {
    setList(prev => prev.map(x => x.name === i.name ? { ...x, status: 'Connected', tone: 'success' } : x));
    commitOnChain({ entity: 'Integration', action: `Connection tested (${i.name})` });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{list.length} external services configured</p>
        <Button onClick={() => setAdd(true)} data-testid="add-integration-btn"><Plus className="h-4 w-4 mr-1.5" /> Add Integration</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {list.map(i => (
          <Card key={i.name} className="p-5" data-testid={`integration-${i.name.replace(/\s/g, '-')}`}>
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
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onTest(i)}>Test Connection</Button>
              <Button variant="ghost" size="sm" onClick={() => setEdit(i)} data-testid={`configure-${i.name.replace(/\s/g, '-')}`}>Configure</Button>
            </div>
          </Card>
        ))}
      </div>

      <IntegrationFormDialog open={add} onClose={() => setAdd(false)} onSave={onAdd} mode="add" />
      <IntegrationFormDialog open={!!edit} onClose={() => setEdit(null)} onSave={(d) => { setList(prev => prev.map(x => x.name === edit.name ? { ...x, ...d } : x)); commitOnChain({ entity: 'Integration', action: `Updated (${d.name})` }); setEdit(null); }} mode="edit" initial={edit} />
    </>
  );
}

function IntegrationFormDialog({ open, onClose, onSave, mode, initial }) {
  const [data, setData] = useState({ name: '', tag: '', url: '', clientId: '', secret: '' });
  React.useEffect(() => {
    if (open) setData(initial ? { ...initial, clientId: '', secret: '' } : { name: '', tag: '', url: '', clientId: '', secret: '' });
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Integration' : `Configure ${initial?.name}`}</DialogTitle>
          <DialogDescription>Wire an external service to the ESIC platform. Credentials are encrypted at rest.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Service Name</Label><Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. Bharat Connect" data-testid="integration-name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Category</Label><Input value={data.tag} onChange={(e) => setData({ ...data, tag: e.target.value })} placeholder="e.g. KYC" /></div>
            <div><Label className="text-xs">Endpoint URL</Label><Input value={data.url} onChange={(e) => setData({ ...data, url: e.target.value })} placeholder="https://api.…" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Client ID</Label><Input value={data.clientId} onChange={(e) => setData({ ...data, clientId: e.target.value })} /></div>
            <div><Label className="text-xs">Secret</Label><Input type="password" value={data.secret} onChange={(e) => setData({ ...data, secret: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!data.name) { toast.error('Name required'); return; } onSave(data); }} data-testid="save-integration">Save & Sign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Workflows ---------- */
function WorkflowsTab() {
  const { db, setDb, commitOnChain } = useStore();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState(null);

  const list = db.workflows || [];

  const remove = (wf) => {
    commitOnChain({
      entity: 'Workflow', action: `Deleted (${wf.id})`,
      mutate: (prev) => ({ ...prev, workflows: prev.workflows.filter(w => w.id !== wf.id) }),
    });
    toast.success(`${wf.name} deleted`);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{list.length} active workflows · drag-friendly designer</p>
        <Button onClick={() => setOpen(true)} data-testid="create-workflow-btn"><Plus className="h-4 w-4 mr-1.5" /> Create Workflow</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {list.map(wf => (
          <Card key={wf.id} className="p-5" data-testid={`workflow-${wf.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{wf.id}</div>
                <h4 className="font-display text-base font-semibold mt-0.5">{wf.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{wf.steps.length} steps · {wf.active ? 'Active' : 'Disabled'}</p>
              </div>
              <Badge variant={wf.active ? 'default' : 'outline'} className="bg-success/10 text-success border-success/30">
                {wf.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-2">
              {wf.steps.map((s, i, a) => (
                <React.Fragment key={s + i}>
                  <div className="rounded-md border border-primary/30 bg-primary-soft text-primary px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0">
                    {i + 1}. {s}
                  </div>
                  {i < a.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setView(wf)} data-testid={`view-workflow-${wf.id}`}>View Details</Button>
              <Button variant="outline" size="sm" onClick={() => setEdit(wf)}><Edit3 className="h-3.5 w-3.5 mr-1" /> Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => remove(wf)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <WorkflowFormDialog
        open={open || !!edit}
        onClose={() => { setOpen(false); setEdit(null); }}
        initial={edit}
        onSave={(data) => {
          if (edit) {
            commitOnChain({
              entity: 'Workflow', action: `Updated (${edit.id})`,
              mutate: (prev) => ({ ...prev, workflows: prev.workflows.map(w => w.id === edit.id ? { ...w, ...data } : w) }),
            });
            toast.success(`${data.name} updated`);
          } else {
            const id = `WF-${(list.length + 1).toString().padStart(3, '0')}`;
            commitOnChain({
              entity: 'Workflow', action: `Created (${id})`,
              mutate: (prev) => ({ ...prev, workflows: [{ id, ...data, createdAt: new Date().toISOString() }, ...prev.workflows] }),
            });
            toast.success(`${data.name} created`);
          }
          setOpen(false); setEdit(null);
        }}
      />

      <WorkflowDetailDialog open={!!view} onClose={() => setView(null)} workflow={view} />
    </>
  );
}

function WorkflowFormDialog({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [active, setActive] = useState(true);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setStepsText((initial?.steps || []).join('\n'));
      setActive(initial?.active ?? true);
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
          <DialogDescription>Define an ordered set of steps. Every transition will be signed on the ESIC chain.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Workflow Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Promotion Approval" data-testid="workflow-name" /></div>
          <div>
            <Label className="text-xs">Steps (one per line, ordered)</Label>
            <Textarea rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={'Initiate\nDept. Head Review\nApprove'} data-testid="workflow-steps" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={active} onCheckedChange={setActive} /> Activate immediately
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            const steps = stepsText.split('\n').map(s => s.trim()).filter(Boolean);
            if (!name || steps.length < 2) { toast.error('Name + at least 2 steps required'); return; }
            onSave({ name, steps, active });
          }} data-testid="save-workflow">Save & Sign on Chain</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorkflowDetailDialog({ open, onClose, workflow }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> {workflow?.name}</DialogTitle>
          <DialogDescription>{workflow?.id} · {workflow?.steps?.length} steps · created {workflow && new Date(workflow.createdAt).toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        {workflow && (
          <ol className="space-y-2">
            {workflow.steps.map((s, i) => (
              <li key={s + i} className="flex items-center gap-3 rounded-md border border-border p-3">
                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{s}</div>
                  <div className="text-[11px] text-muted-foreground">Hashed transition · SLA 24h</div>
                </div>
                <Badge variant="outline" className="text-[10px]"><Hash className="h-3 w-3 mr-1" /> {`0x${(i + 1).toString(16).padStart(4, '0')}…`}</Badge>
              </li>
            ))}
          </ol>
        )}
        <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Roles ---------- */
function RolesTab() {
  const { db, commitOnChain } = useStore();
  const [open, setOpen] = useState(false);
  const [configure, setConfigure] = useState(null);
  const list = db.roles || [];

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{list.length} system roles · permission matrix</p>
        <Button onClick={() => setOpen(true)} data-testid="create-role-btn"><Plus className="h-4 w-4 mr-1.5" /> Create Role</Button>
      </div>
      <Card className="p-5">
        <div className="grid md:grid-cols-2 gap-3">
          {list.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3" data-testid={`role-${r.id}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0"><Shield className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.users} users · {r.permissions.length} perms</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setConfigure(r)} data-testid={`configure-role-${r.id}`}>Configure</Button>
            </div>
          ))}
        </div>
      </Card>

      <RoleFormDialog
        open={open || !!configure}
        onClose={() => { setOpen(false); setConfigure(null); }}
        initial={configure}
        onSave={(data) => {
          if (configure) {
            commitOnChain({
              entity: 'Role', action: `Updated (${configure.id})`,
              mutate: (prev) => ({ ...prev, roles: prev.roles.map(r => r.id === configure.id ? { ...r, ...data } : r) }),
            });
            toast.success(`${data.name} updated`);
          } else {
            const id = `ROLE-${(list.length + 1).toString().padStart(2, '0')}`;
            commitOnChain({
              entity: 'Role', action: `Created (${id})`,
              mutate: (prev) => ({ ...prev, roles: [...prev.roles, { id, ...data, users: 0, active: true, createdAt: new Date().toISOString() }] }),
            });
            toast.success(`${data.name} created`);
          }
          setOpen(false); setConfigure(null);
        }}
      />
    </>
  );
}

function RoleFormDialog({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('');
  const [perms, setPerms] = useState([]);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setPerms(initial?.permissions || ['view']);
    }
  }, [open, initial]);

  const togglePerm = (p) => setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? `Configure ${initial.name}` : 'Create Role'}</DialogTitle>
          <DialogDescription>Define a role and its module-level permissions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Role Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Audit Officer" data-testid="role-name" /></div>
          <div>
            <Label className="text-xs mb-2 block">Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMS.map(p => (
                <label key={p} className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:border-primary/40">
                  <Checkbox checked={perms.includes(p)} onCheckedChange={() => togglePerm(p)} data-testid={`role-perm-${p}`} />
                  <span className="text-sm capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!name) { toast.error('Name required'); return; } onSave({ name, permissions: perms }); }} data-testid="save-role">Save & Sign on Chain</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Master Data ---------- */
function MasterDataTab() {
  const { db, setDb, commitOnChain } = useStore();
  const [openCat, setOpenCat] = useState(null);
  const masterData = db.masterData || {};
  const categories = Object.keys(masterData);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold">Master Data Categories</h3>
          <p className="text-xs text-muted-foreground">{categories.length} categories · {Object.values(masterData).reduce((s, a) => s + a.length, 0)} values</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map(c => (
            <Card key={c} className="p-4 hover:border-primary cursor-pointer transition-colors" onClick={() => setOpenCat(c)} data-testid={`master-cat-${c.replace(/\s/g, '-')}`}>
              <Database className="h-5 w-5 text-primary mb-2" />
              <div className="font-medium text-sm">{c}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{masterData[c].length} values · click to manage</div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={!!openCat} onOpenChange={(o) => !o && setOpenCat(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> {openCat}</DialogTitle>
            <DialogDescription>Add, edit and remove values for this master data category. Changes are signed on-chain.</DialogDescription>
          </DialogHeader>
          {openCat && (
            <MasterDataEditor
              category={openCat}
              values={masterData[openCat] || []}
              onChange={(nextValues, action) => {
                commitOnChain({
                  entity: 'Master Data', action: `${action} (${openCat})`,
                  mutate: (prev) => ({ ...prev, masterData: { ...prev.masterData, [openCat]: nextValues } }),
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MasterDataEditor({ category, values, onChange }) {
  const [list, setList] = useState(values);
  const [newVal, setNewVal] = useState('');
  React.useEffect(() => { setList(values); }, [values, category]);

  const add = () => {
    const v = newVal.trim();
    if (!v) return;
    if (list.includes(v)) { toast.error('Value already exists'); return; }
    const next = [...list, v];
    setList(next); setNewVal('');
    onChange(next, `Added ${v}`);
    toast.success(`Added "${v}"`);
  };
  const remove = (v) => {
    const next = list.filter(x => x !== v);
    setList(next);
    onChange(next, `Removed ${v}`);
    toast.success(`Removed "${v}"`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder={`Add new ${category.toLowerCase()}…`} onKeyDown={(e) => e.key === 'Enter' && add()} data-testid="master-value-input" />
        <Button onClick={add} data-testid="master-add-btn"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border">
        {list.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No values yet.</div>
        ) : list.map(v => (
          <div key={v} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">{v}</span>
            <Button variant="ghost" size="sm" onClick={() => remove(v)} className="text-destructive hover:text-destructive h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Translations / Blockchain / API (mostly informational) ---------- */
function TranslationsTab() {
  return (
    <Card className="p-6">
      <h3 className="font-display text-base font-semibold mb-2">Translation Management</h3>
      <p className="text-xs text-muted-foreground mb-4">All UI strings synchronized across 3 languages. Switch instantly from topbar.</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { lang: 'English', count: 145, completeness: 100 },
          { lang: 'தமிழ் (Tamil)', count: 145, completeness: 100 },
          { lang: 'हिन्दी (Hindi)', count: 145, completeness: 100 },
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
  );
}

function BlockchainTab() {
  return (
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
  );
}

function ApiCatalogTab() {
  return (
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
            <Button variant="ghost" size="sm" onClick={() => toast.success(`Tried ${a.method} ${a.path} → 200 OK`)}>Try</Button>
          </li>
        ))}
      </ul>
    </Card>
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
