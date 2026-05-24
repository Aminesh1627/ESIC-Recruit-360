import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Globe, Sparkles, Building2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore, ROLES } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { languages } from '@/i18n/translations';
import { toast } from 'sonner';

const QUICK_ROLES = [
  { id: 'recruitment_admin', label: 'Recruitment Admin', icon: ShieldCheck, route: '/dashboard' },
  { id: 'candidate', label: 'Candidate', icon: Building2, route: '/portal' },
  { id: 'super_admin', label: 'Super Admin', icon: Sparkles, route: '/admin' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useStore();
  const { lang, setLang, t } = useLang();
  const [username, setUsername] = useState('admin.user@esic.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [role, setRole] = useState('recruitment_admin');
  const [showPw, setShowPw] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    login(username, role);
    toast.success(`Welcome back, ${username.split('@')[0]}!`);
    const r = ROLES.find(x => x.id === role);
    navigate(r?.id === 'candidate' ? '/portal' : r?.id === 'super_admin' ? '/admin' : '/dashboard');
  };

  const quick = (q) => {
    setRole(q.id);
    login('demo.officer', q.id);
    toast.success(`Signed in as ${q.label}`);
    navigate(q.route);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[52%] relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-[0.08]" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">ESIC Recruit<span className="text-accent">360</span></div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{t('poweredBy')}</div>
            </div>
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs border border-white/15 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary pulse-ring" />
              Blockchain-secured recruitment governance · v3.2
            </div>
            <h1 className="font-display text-4xl xl:text-5xl font-semibold leading-[1.1] text-balance">
              Trusted Recruitment.
              <br />
              <span className="text-accent">Immutable</span> Governance.
            </h1>
            <p className="mt-5 text-white/75 leading-relaxed">
              An enterprise-grade platform built for the Employees' State Insurance Corporation —
              orchestrating the entire recruitment lifecycle from vacancy creation to offer issuance,
              with cryptographically verifiable audit trails.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: '14', l: 'Role-based workflows' },
                { k: '120+', l: 'Blockchain events / day' },
                { k: '99.99%', l: 'SLA-compliant audits' },
              ].map(s => (
                <div key={s.l} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="font-display text-2xl font-semibold">{s.k}</div>
                  <div className="text-[11px] text-white/60 mt-0.5 leading-tight">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/55">
            <span>© ESIC, Govt. of India</span>
            <span>{t('partner')}</span>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="font-display text-lg font-semibold">ESIC Recruit360</div>
          </div>

          <div className="flex items-center justify-end mb-2">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(l => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {t('signInToDashboard')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('secureSession')}</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <Label className="text-xs font-medium">{t('username')}</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin.user@esic.gov.in"
                className="h-11 mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">{t('password')}</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-10"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">{t('selectRole')}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ROLES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <Checkbox defaultChecked /> {t('rememberMe')}
              </label>
              <button type="button" className="text-primary hover:underline font-medium">{t('forgotPassword')}</button>
            </div>

            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 hover:opacity-95 shadow-elevated">
              {t('login')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Quick sign-in for demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {QUICK_ROLES.map(q => (
              <button
                key={q.id}
                onClick={() => quick(q)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-xs font-medium hover:border-primary hover:bg-primary-soft transition-colors"
              >
                <q.icon className="h-4 w-4 text-primary" />
                {q.label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-center text-muted-foreground">
            By signing in, you agree to ESIC IT Acceptable Use Policy. All actions are audit-logged on-chain.
          </p>
        </div>
      </div>
    </div>
  );
}
