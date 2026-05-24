import React from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Hash, Zap, ExternalLink } from 'lucide-react';

// Deterministic-ish hash generator (looks legit, not really sha256)
export function generateTxHash() {
  let h = '0x';
  for (let i = 0; i < 16; i++) h += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  return h;
}

// Gas savings vs ETHL1 = always between 88-99% (it's a private chain marketing pitch)
export function generateGasSavings() {
  return (88 + Math.random() * 11).toFixed(2);
}

export function generateBlockNumber() {
  return 8_420_000 + Math.floor(Math.random() * 50_000);
}

/**
 * Show a blockchain transaction toast that mimics on-chain signing.
 * Returns { hash, gas, block } so the caller can also persist the values.
 */
export function showTxToast({ entity, action, performedBy = 'system@esic', onView }) {
  const hash = generateTxHash();
  const gas = generateGasSavings();
  const block = generateBlockNumber();
  const short = `${hash.slice(0, 10)}…${hash.slice(-4)}`;

  toast.custom((id) => (
    <div className="w-[360px] rounded-lg border border-primary/30 bg-card shadow-elevated overflow-hidden" data-testid="tx-toast">
      <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 ring-4 ring-primary/10">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground tracking-tight">Block sealed on ESIC Chain</p>
            <span className="inline-flex items-center text-[9px] font-medium uppercase tracking-wider text-success bg-success-soft border border-success/30 rounded px-1.5 py-0.5">Verified</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            <span className="font-medium text-foreground">{entity}</span> · {action}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="rounded bg-muted/60 px-2 py-1">
              <div className="text-muted-foreground flex items-center gap-1"><Hash className="h-2.5 w-2.5" /> Tx</div>
              <code className="font-mono text-foreground">{short}</code>
            </div>
            <div className="rounded bg-muted/60 px-2 py-1">
              <div className="text-muted-foreground flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Gas saved</div>
              <span className="font-mono text-success font-semibold">{gas}%</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">#{block.toLocaleString()}</span>
            <button
              onClick={() => {
                if (onView) {
                  onView(hash);
                } else {
                  try {
                    window.history.pushState({}, '', `/ledger?tx=${hash}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  } catch (e) {}
                }
                toast.dismiss(id);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
              data-testid="tx-toast-view-ledger"
            >
              View on ESIC Ledger <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 4500 });

  return { hash, gas, block, performedBy };
}
