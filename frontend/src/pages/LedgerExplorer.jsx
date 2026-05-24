import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Search, ShieldCheck, Hash, Boxes, Activity, Zap, ArrowRight, Clock, User,
  ChevronRight, Copy, Cpu, Layers, RefreshCw, Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ENTITIES = ['All', 'Vacancy', 'Application', 'Document', 'Interview', 'Merit List', 'Offer Letter', 'Grievance', 'Workflow', 'Role', 'Master Data', 'Integration', 'Result'];

const ENTITY_TONE = {
  Vacancy: 'bg-primary/10 text-primary border-primary/20',
  Application: 'bg-secondary/10 text-secondary border-secondary/20',
  Document: 'bg-warning/15 text-warning border-warning/30',
  Interview: 'bg-accent/15 text-accent-foreground border-accent/30',
  'Merit List': 'bg-success/15 text-success border-success/30',
  'Offer Letter': 'bg-success/15 text-success border-success/30',
  Grievance: 'bg-destructive/10 text-destructive border-destructive/30',
  Workflow: 'bg-primary/10 text-primary border-primary/20',
  Role: 'bg-secondary/10 text-secondary border-secondary/20',
  'Master Data': 'bg-muted text-foreground border-border',
  Integration: 'bg-accent/15 text-accent-foreground border-accent/30',
  Result: 'bg-success/15 text-success border-success/30',
};

const short = (h) => h ? `${h.slice(0, 10)}…${h.slice(-4)}` : '—';
const ago = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function LedgerExplorerPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [openBlock, setOpenBlock] = useState(null);
  const [openTx, setOpenTx] = useState(null);

  // Group events into blocks (events already carry .block when produced via store; else bucket-by-4).
  const blocks = useMemo(() => {
    const map = new Map();
    db.blockchain.forEach((e, idx) => {
      const blockNum = e.block ?? (8_420_000 + Math.floor(idx / 4));
      if (!map.has(blockNum)) {
        map.set(blockNum, {
          number: blockNum,
          parentHash: e.parentHash ?? `0x${(blockNum - 1).toString(16)}…`,
          validator: e.validator ?? 'esic-validator-01.gov.in',
          timestamp: e.timestamp,
          txs: [],
          gasSavings: e.gasSavings,
        });
      }
      const b = map.get(blockNum);
      b.txs.push(e);
      // Use the latest tx timestamp as block timestamp
      if (new Date(e.timestamp) > new Date(b.timestamp)) b.timestamp = e.timestamp;
    });
    return Array.from(map.values()).sort((a, b) => b.number - a.number);
  }, [db.blockchain]);

  const filteredBlocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blocks.filter(b => {
      if (filter !== 'All' && !b.txs.some(t => t.entity === filter)) return false;
      if (!q) return true;
      if (String(b.number).includes(q)) return true;
      if (b.parentHash?.toLowerCase().includes(q)) return true;
      return b.txs.some(t =>
        t.hash?.toLowerCase().includes(q) ||
        t.action?.toLowerCase().includes(q) ||
        t.entity?.toLowerCase().includes(q) ||
        t.performedBy?.toLowerCase().includes(q)
      );
    });
  }, [blocks, filter, query]);

  const totalTx = db.blockchain.length;
  const verifiedRate = (db.blockchain.filter(b => b.verified).length / Math.max(1, totalTx) * 100).toFixed(2);
  const avgGas = (db.blockchain.reduce((s, e) => s + parseFloat(e.gasSavings || '90'), 0) / Math.max(1, totalTx)).toFixed(1);

  // Deep-link support: ?tx=<hash> highlights and opens that tx
  useEffect(() => {
    const tx = params.get('tx');
    if (tx) {
      const found = db.blockchain.find(e => e.hash === tx);
      if (found) setOpenTx(found);
    }
  }, [params, db.blockchain]);

  return (
    <div>
      <PageHeader
        title="ESIC Chain Explorer"
        subtitle="Real-time on-chain ledger · cryptographically signed · immutable governance"
        badge={<Badge variant="outline" className="ml-1 gap-1.5 bg-success-soft text-success border-success/30"><span className="h-1.5 w-1.5 rounded-full bg-success pulse-ring" /> Network Live</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('Ledger refreshed')} data-testid="explorer-refresh">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/audit"><Activity className="h-4 w-4 mr-1.5" /> Timeline view</Link>
            </Button>
          </>
        }
      />

      {/* Network stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-5">
        <KpiCard label="Chain height" value={`#${(blocks[0]?.number || 0).toLocaleString()}`} icon={Layers} tone="primary" sublabel="Latest block" />
        <KpiCard label="Total blocks" value={blocks.length.toLocaleString()} icon={Boxes} tone="secondary" />
        <KpiCard label="Total transactions" value={totalTx.toLocaleString()} icon={Hash} tone="accent" />
        <KpiCard label="Verified rate" value={`${verifiedRate}%`} icon={ShieldCheck} tone="success" />
        <KpiCard label="Avg gas savings" value={`${avgGas}%`} icon={Zap} tone="warning" sublabel="vs Ethereum L1" />
      </div>

      {/* Network card */}
      <Card className="p-5 mb-5 bg-gradient-to-br from-primary-soft/50 via-card to-secondary-soft/30 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Network</div>
              <div className="font-display text-base font-semibold">esic-private-chain · IBFT 2.0</div>
              <div className="text-xs text-muted-foreground mt-0.5">4 validator nodes · 6s block time · Permissioned</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1"><ShieldCheck className="h-3 w-3 text-success" /> SHA-256 / ECDSA</Badge>
            <Badge variant="outline" className="text-xs gap-1"><Activity className="h-3 w-3 text-primary" /> 99.99% uptime</Badge>
            <Badge variant="outline" className="text-xs gap-1"><Zap className="h-3 w-3 text-warning" /> {avgGas}% gas savings</Badge>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by block #, transaction hash, entity, action, or address…"
            className="pl-10 h-11"
            data-testid="explorer-search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              clear
            </button>
          )}
        </div>
      </Card>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto justify-start flex-wrap h-auto" data-testid="explorer-entity-filter">
          {ENTITIES.map(e => (
            <TabsTrigger key={e} value={e} data-testid={`explorer-filter-${e.replace(/\s/g, '-')}`}>
              {e}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {e === 'All' ? totalTx : db.blockchain.filter(b => b.entity === e).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Blocks list */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-medium">
          <span>{filteredBlocks.length} block{filteredBlocks.length === 1 ? '' : 's'}</span>
          <span>Newest first</span>
        </div>
        <div className="divide-y divide-border">
          {filteredBlocks.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No blocks match the current filter.</div>
          ) : filteredBlocks.slice(0, 40).map(b => (
            <button
              key={b.number}
              onClick={() => setOpenBlock(b)}
              className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-start gap-4 group"
              data-testid={`block-row-${b.number}`}
            >
              <div className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-base font-semibold">Block #{b.number.toLocaleString()}</span>
                  <Badge variant="outline" className="text-[10px]"><Hash className="h-2.5 w-2.5 mr-0.5" /> {b.txs.length} tx</Badge>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {ago(b.timestamp)}</span>
                </div>
                <div className="mt-1 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> Parent: <code className="font-mono">{short(b.parentHash)}</code></span>
                  <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Validator: <code className="font-mono">{b.validator}</code></span>
                </div>
                {/* Entity chips for transactions in this block */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.from(new Set(b.txs.map(x => x.entity))).slice(0, 6).map(en => (
                    <span key={en} className={cn('inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border', ENTITY_TONE[en] || 'bg-muted text-foreground border-border')}>
                      {en}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground self-center opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
        {filteredBlocks.length > 40 && (
          <div className="p-3 border-t border-border bg-muted/20 text-center text-xs text-muted-foreground">
            Showing first 40 of {filteredBlocks.length}. Use search or filter to narrow down.
          </div>
        )}
      </Card>

      {/* Block detail dialog */}
      <Dialog open={!!openBlock} onOpenChange={(o) => !o && setOpenBlock(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Block #{openBlock?.number.toLocaleString()}</DialogTitle>
            <DialogDescription>
              {openBlock?.txs.length} transactions · {openBlock && new Date(openBlock.timestamp).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {openBlock && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-2">
                <BlockMeta label="Block number" value={`#${openBlock.number.toLocaleString()}`} mono />
                <BlockMeta label="Validator" value={openBlock.validator} mono />
                <BlockMeta label="Parent hash" value={short(openBlock.parentHash)} mono onCopy={() => copy(openBlock.parentHash)} />
                <BlockMeta label="Transactions" value={openBlock.txs.length} />
                <BlockMeta label="Timestamp" value={new Date(openBlock.timestamp).toLocaleString()} />
                <BlockMeta label="Gas saved" value={`${openBlock.gasSavings || '92.0'}%`} />
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Transactions in this block</div>
                <div className="rounded-md border border-border divide-y divide-border">
                  {openBlock.txs.map(tx => (
                    <button
                      key={tx.id}
                      onClick={() => setOpenTx(tx)}
                      className="w-full text-left p-3 hover:bg-muted/40 transition-colors group"
                      data-testid={`tx-row-${tx.id}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', ENTITY_TONE[tx.entity] || 'bg-muted border-border')}>{tx.entity}</span>
                        <span className="text-sm font-medium">{tx.action}</span>
                        {tx.verified && <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">verified</Badge>}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <code className="font-mono">{short(tx.hash)}</code>
                        <span className="inline-flex items-center gap-0.5"><User className="h-2.5 w-2.5" /> {tx.performedBy}</span>
                        <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {ago(tx.timestamp)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBlock(null)}>Close</Button>
            <Button onClick={() => copy(openBlock?.parentHash || '')}><Copy className="h-4 w-4 mr-1.5" /> Copy parent hash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tx detail dialog */}
      <Dialog open={!!openTx} onOpenChange={(o) => !o && setOpenTx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Transaction</DialogTitle>
            <DialogDescription>{openTx?.id} · sealed in block #{openTx?.block?.toLocaleString?.() ?? '—'}</DialogDescription>
          </DialogHeader>
          {openTx && (
            <div className="space-y-2.5">
              <Field icon={Boxes} label="Entity" value={<Badge variant="outline" className={cn('text-[11px]', ENTITY_TONE[openTx.entity])}>{openTx.entity}</Badge>} />
              <Field icon={Hash} label="Action" value={<span className="font-medium">{openTx.action}</span>} />
              <Field icon={Hash} label="Tx Hash" value={<code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">{openTx.hash}</code>} />
              {openTx.block && <Field icon={Layers} label="Block #" value={<code className="font-mono text-xs">{openTx.block.toLocaleString()}</code>} />}
              {openTx.parentHash && <Field icon={Link2} label="Parent hash" value={<code className="text-xs font-mono">{short(openTx.parentHash)}</code>} />}
              <Field icon={User} label="Performed by" value={openTx.performedBy} />
              <Field icon={Clock} label="Timestamp" value={new Date(openTx.timestamp).toLocaleString()} />
              {openTx.gasSavings && <Field icon={Zap} label="Gas savings" value={<span className="text-success font-semibold">{openTx.gasSavings}%</span>} />}
              {openTx.validator && <Field icon={Cpu} label="Validator" value={<code className="text-xs font-mono">{openTx.validator}</code>} />}
              <Field icon={ShieldCheck} label="Status" value={
                openTx.verified
                  ? <Badge className="bg-success/15 text-success border-success/30">Verified · Finalized</Badge>
                  : <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">Pending</Badge>
              } />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTx(null)}>Close</Button>
            <Button onClick={() => copy(openTx?.hash || '')}><Copy className="h-4 w-4 mr-1.5" /> Copy hash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlockMeta({ label, value, mono, onCopy }) {
  return (
    <div className="rounded-md border border-border p-2.5 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-sm font-medium mt-0.5 break-all ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5" title="Copy">
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
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

function copy(text) {
  try { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); } catch (e) { toast.error('Copy failed'); }
}
