import React from 'react';
import { ShieldCheck, Hash, User, Clock, BadgeCheck } from 'lucide-react';

export function BlockchainTimeline({ events = [], compact = false }) {
  if (!events.length) return (
    <div className="text-sm text-muted-foreground py-6 text-center">No blockchain events yet.</div>
  );
  return (
    <ol className="relative border-l-2 border-dashed border-primary/20 pl-5 space-y-4">
      {events.map((e, idx) => (
        <li key={e.id || idx} className="relative">
          <span className="absolute -left-[27px] top-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-4 ring-background">
            <ShieldCheck className="h-3 w-3" />
          </span>
          <div className="rounded-lg border border-border bg-card p-3 shadow-card">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-foreground">{e.entity}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">{e.action}</span>
              {e.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2 py-0.5 text-[10px] font-medium border border-success/30">
                  <BadgeCheck className="h-3 w-3" /> Verified on-chain
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 mono font-mono"><Hash className="h-3 w-3" />{e.hash}</span>
              <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{e.performedBy}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
