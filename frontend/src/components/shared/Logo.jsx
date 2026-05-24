import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Logo({ variant = 'light', size = 'md' }) {
  const dark = variant === 'dark';
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative h-9 w-9 rounded-md flex items-center justify-center ${dark ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white border border-white/15'}`}>
        <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-secondary border-2 border-sidebar" />
      </div>
      <div className="leading-tight">
        <div className={`font-display font-semibold tracking-tight ${dark ? 'text-foreground' : 'text-white'} ${sizes[size]}`}>
          ESIC <span className="font-bold">Recruit360</span>
        </div>
        <div className={`text-[10px] uppercase tracking-[0.18em] ${dark ? 'text-muted-foreground' : 'text-white/55'}`}>
          Trusted Recruitment
        </div>
      </div>
    </div>
  );
}
