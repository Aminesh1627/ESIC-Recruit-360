import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VacancyDetailDrawer } from '@/components/vacancy/VacancyDetailDrawer';
import { Megaphone, Calendar, ExternalLink, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvertisementsPage() {
  const { db } = useStore();
  const { t } = useLang();
  const ads = db.vacancies.filter(v => v.status === 'Published').slice(0, 12);
  const [open, setOpen] = useState(null);

  return (
    <div>
      <PageHeader title={t('advertisements')} subtitle="Public-facing recruitment advertisements" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ads.map(v => (
          <Card
            key={v.id}
            className="p-5 flex flex-col cursor-pointer hover:border-primary/40 hover:shadow-elevated transition-all"
            onClick={() => setOpen(v)}
            data-testid={`ad-card-${v.id}`}
          >
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
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Closes in {Math.floor((Math.abs(v.id.charCodeAt(v.id.length - 1)) % 30) + 7)} days
            </div>
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setOpen(v)} data-testid={`view-ad-${v.id}`}>
                <Eye className="h-3.5 w-3.5 mr-1" /> View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Advertisement PDF downloaded')}><FileText className="h-3.5 w-3.5 mr-1" /> Notification</Button>
              <Button size="sm" onClick={() => toast.success('Public page opened')}><ExternalLink className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <VacancyDetailDrawer open={!!open} onOpenChange={(o) => !o && setOpen(null)} vacancy={open} />
    </div>
  );
}
