import React from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Bell, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResultsPage() {
  const { db } = useStore();
  const { t } = useLang();

  return (
    <div>
      <PageHeader title={t('results')} subtitle="Result publishing workflow · draft → approve → publish" />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.results.map(r => (
          <Card key={r.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{r.id}</div>
                <div className="font-display text-base font-semibold mt-1 truncate">{r.vacancy}</div>
                <div className="text-xs text-muted-foreground">{r.vacancyId}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-accent-soft text-accent-foreground flex items-center justify-center"><Award className="h-5 w-5" /></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Selected</div>
                <div className="font-display text-xl font-semibold mt-0.5">{r.totalSelected}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="mt-1"><StatusBadge status={r.status === 'Published' ? 'Published' : r.status === 'Approved' ? 'Approved' : 'Draft'} /></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Published {new Date(r.publishedAt).toLocaleDateString()}</div>
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 mt-auto">
              <Button variant="outline" size="sm" onClick={() => toast.success('Preview opened (mock)')}><Eye className="h-4 w-4 mr-1.5" /> Preview</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('PDF downloaded (mock)')}><Download className="h-4 w-4 mr-1.5" /> PDF</Button>
              <Button size="sm" onClick={() => toast.success('Candidates notified by SMS + Email')}><Bell className="h-4 w-4 mr-1.5" /> Notify</Button>
              {r.status !== 'Published' && (
                <Button size="sm" variant="secondary" onClick={() => toast.success('Result published & signed on-chain')}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Publish
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
