import React from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Calendar, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvertisementsPage() {
  const { db } = useStore();
  const { t } = useLang();
  const ads = db.vacancies.filter(v => v.status === 'Published').slice(0, 12);

  return (
    <div>
      <PageHeader title={t('advertisements')} subtitle="Public-facing recruitment advertisements" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ads.map(v => (
          <Card key={v.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-md gradient-primary text-white flex items-center justify-center"><Megaphone className="h-5 w-5" /></div>
              <StatusBadge status={v.status} />
            </div>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{v.id}</div>
              <div className="font-display text-base font-semibold mt-1">{v.postName}</div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.jobDescription}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-muted-foreground">Posts</div><div className="font-medium">{v.totalVacancies}</div></div>
              <div><div className="text-muted-foreground">Pay</div><div className="font-medium font-mono">{v.payMatrix}</div></div>
              <div><div className="text-muted-foreground">Loc</div><div className="font-medium">{v.location}</div></div>
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-1.5 mt-auto">
              <Calendar className="h-3.5 w-3.5" /> Closes in {Math.floor(Math.random() * 30) + 7} days
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('Advertisement PDF downloaded')}><FileText className="h-3.5 w-3.5 mr-1" /> Notification</Button>
              <Button size="sm" className="flex-1" onClick={() => toast.success('Public page opened')}><ExternalLink className="h-3.5 w-3.5 mr-1" /> Public</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
