import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BlockchainTimeline } from '@/components/shared/BlockchainTimeline';
import { KpiCard } from '@/components/shared/KpiCard';
import { Search, Download, Hash, ShieldCheck, Boxes, Activity } from 'lucide-react';
import { toast } from 'sonner';

const ENTITIES = ['All', 'Vacancy', 'Application', 'Document', 'Interview', 'Merit List', 'Offer Letter', 'Grievance'];

export default function AuditLedgerPage() {
  const { db } = useStore();
  const { t } = useLang();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = db.blockchain;
    if (filter !== 'All') list = list.filter(b => b.entity === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(b => b.hash.toLowerCase().includes(q) || b.action.toLowerCase().includes(q) || b.performedBy.toLowerCase().includes(q));
    }
    return list;
  }, [db.blockchain, filter, query]);

  return (
    <div>
      <PageHeader
        title={t('auditLedger')}
        subtitle="Immutable blockchain log of every state transition"
        actions={<Button variant="outline" onClick={() => toast.success('Ledger exported to PDF')}><Download className="h-4 w-4 mr-1.5" /> {t('exportPdf')}</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Total events" value={db.blockchain.length} icon={Boxes} tone="primary" />
        <KpiCard label="Verified blocks" value={db.blockchain.filter(b => b.verified).length} icon={ShieldCheck} tone="success" />
        <KpiCard label="Active entities" value={new Set(db.blockchain.map(b => b.entity)).size} icon={Activity} tone="accent" />
        <KpiCard label="Latest block" value={new Date(db.blockchain[0]?.timestamp).toLocaleTimeString()} icon={Hash} tone="secondary" />
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="bg-muted/50 overflow-x-auto justify-start">
          {ENTITIES.map(e => (
            <TabsTrigger key={e} value={e}>{e}
              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">
                {e === 'All' ? db.blockchain.length : db.blockchain.filter(b => b.entity === e).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hash, action, performer…" className="pl-10" />
        </div>
      </Card>

      <Card className="p-5">
        <BlockchainTimeline events={filtered.slice(0, 30)} />
      </Card>
    </div>
  );
}
