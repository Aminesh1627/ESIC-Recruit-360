import React, { useState } from 'react';
import { ShieldCheck, Hash, User, Clock, BadgeCheck, Eye, Zap, Boxes } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BlockchainTimeline({ events = [], compact = false }) {
  const [open, setOpen] = useState(null);

  if (!events.length) return (
    <div className="text-sm text-muted-foreground py-6 text-center">No blockchain events yet.</div>
  );
  return (
    <>
      <ol className="relative border-l-2 border-dashed border-primary/20 pl-5 space-y-4">
        {events.map((e, idx) => (
          <li key={e.id || idx} className="relative">
            <span className="absolute -left-[27px] top-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-4 ring-background">
              <ShieldCheck className="h-3 w-3" />
            </span>
            <div
              className="rounded-lg border border-border bg-card p-3 shadow-card hover:border-primary/40 hover:shadow-elevated transition-all cursor-pointer group"
              onClick={() => setOpen(e)}
              data-testid={`bc-event-${e.id || idx}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{e.entity}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground">{e.action}</span>
                {e.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2 py-0.5 text-[10px] font-medium border border-success/30">
                    <BadgeCheck className="h-3 w-3" /> Verified on-chain
                  </span>
                )}
                <Eye className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-mono"><Hash className="h-3 w-3" />{e.hash}</span>
                {!compact && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{e.performedBy}</span>}
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Block · {open?.id || '—'}</DialogTitle>
            <DialogDescription>Immutable on-chain record. All fields are cryptographically signed.</DialogDescription>
          </DialogHeader>
          {open && (
            <div className="space-y-2.5">
              <Field icon={Boxes} label="Entity" value={<Badge variant="outline">{open.entity}</Badge>} />
              <Field icon={Hash} label="Action" value={<span className="font-medium">{open.action}</span>} />
              <Field icon={Hash} label="Tx Hash" value={<code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">{open.hash}</code>} />
              {open.block && <Field icon={Boxes} label="Block #" value={<code className="font-mono text-xs">{open.block.toLocaleString()}</code>} />}
              <Field icon={User} label="Performed by" value={open.performedBy} />
              <Field icon={Clock} label="Timestamp" value={new Date(open.timestamp).toLocaleString()} />
              {open.gasSavings && <Field icon={Zap} label="Gas savings vs L1" value={<span className="text-success font-semibold">{open.gasSavings}%</span>} />}
              <Field icon={BadgeCheck} label="Status" value={
                open.verified
                  ? <Badge className="bg-success/15 text-success border-success/30">Verified</Badge>
                  : <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">Pending</Badge>
              } />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            <Button onClick={() => {
              try { navigator.clipboard.writeText(open?.hash || ''); } catch (e) {}
            }}>
              <Hash className="h-4 w-4 mr-1.5" /> Copy Hash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border p-2.5">
      <div className="h-7 w-7 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm mt-0.5 break-all">{value}</div>
      </div>
    </div>
  );
}
