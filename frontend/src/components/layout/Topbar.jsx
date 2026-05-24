import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, LogOut, ChevronDown, Globe, ShieldCheck, RotateCw, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { languages } from '@/i18n/translations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user, logout, notifications, markNotificationsRead, resetData } = useStore();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  const unread = notifications.filter(n => !n.read).length;

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const crumb = () => {
    const seg = location.pathname.split('/').filter(Boolean);
    if (!seg.length) return 'Home';
    return seg.map(s => s.replace(/-/g, ' ')).join(' / ');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{user?.roleLabel || 'Dashboard'}</p>
        <p className="text-sm font-medium text-foreground capitalize truncate">{crumb()}</p>
      </div>

      <div className="hidden md:flex relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`${t('search')}…  (vacancies, candidates, applications)`}
          className="h-10 w-[320px] pl-10 bg-muted/40 border-muted focus-visible:bg-card"
        />
      </div>

      {/* Language */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{languages.find(l => l.code === lang)?.short}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map(l => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => { setLang(l.code); toast.success(`Language → ${l.label}`); }}
              className={cn('justify-between', l.code === lang && 'bg-accent/15 text-accent-foreground')}
            >
              <span>{l.label}</span>
              <span className="text-xs text-muted-foreground font-mono">{l.short}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme */}
      <Button variant="outline" size="icon" onClick={toggleTheme} className="hidden sm:inline-flex">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      {/* Notifications */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
                {unread}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{t('notifications')}</span>
              <Button variant="ghost" size="sm" onClick={markNotificationsRead}>Mark all read</Button>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={cn('rounded-lg border p-3', !n.read ? 'border-primary/30 bg-primary-soft' : 'border-border bg-card')}>
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full',
                    n.type === 'success' ? 'bg-success' :
                    n.type === 'warning' ? 'bg-warning' :
                    n.type === 'info' ? 'bg-primary' : 'bg-muted-foreground'
                  )} />
                  <p className="text-sm font-medium text-foreground flex-1">{n.title}</p>
                </div>
                <p className="ml-4 mt-1 text-xs text-muted-foreground">{n.time}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* User */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8 ring-2 ring-accent/30">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(user?.name || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-sm font-medium text-foreground">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">{user?.roleLabel}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ShieldCheck className="mr-2 h-4 w-4" /> Verify Identity (Aadhaar)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { resetData(); toast.success('Demo data reset'); }}>
            <RotateCw className="mr-2 h-4 w-4" /> Reset Demo Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
