import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KpiCard({ label, value, delta, icon: Icon, tone = 'primary', sublabel }) {
  const tones = {
    primary:    'bg-primary/10 text-primary',
    secondary:  'bg-secondary/10 text-secondary',
    accent:     'bg-accent/15 text-accent-foreground',
    warning:    'bg-warning/15 text-warning',
    success:    'bg-success/15 text-success',
    destructive:'bg-destructive/10 text-destructive',
    pending:    'bg-pending/10 text-pending',
  };
  const up = (delta || '').toString().startsWith('+');
  return (
    <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow duration-200 group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn('inline-flex items-center gap-0.5 font-medium', up ? 'text-success' : 'text-destructive')}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
}
