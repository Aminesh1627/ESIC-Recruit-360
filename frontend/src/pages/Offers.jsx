import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLang } from '@/i18n/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, Download, Send, FileSignature } from 'lucide-react';
import { toast } from 'sonner';

export default function OffersPage() {
  const { db, updateOfferStatus } = useStore();
  const { t } = useLang();
  const [preview, setPreview] = useState(null);

  return (
    <div>
      <PageHeader title={t('offers')} subtitle="Offer letter generation with digital signature workflow" />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Offer ID</TableHead>
              <TableHead>{t('candidate')}</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Pay Level</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.offers.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8"><AvatarImage src={o.candidatePhoto} /><AvatarFallback>{o.candidateName[0]}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium">{o.candidateName}</span>
                  </div>
                </TableCell>
                <TableCell>{o.post}</TableCell>
                <TableCell><span className="font-mono text-xs">{o.payLevel}</span></TableCell>
                <TableCell>{new Date(o.joiningDate).toLocaleDateString()}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreview(o)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Offer PDF downloaded')}><Download className="h-4 w-4" /></Button>
                  {o.status === 'Draft' && (
                    <Button size="sm" onClick={() => { updateOfferStatus(o.id, 'Sent'); toast.success('Offer dispatched to candidate'); }}>
                      <Send className="h-4 w-4 mr-1" /> Send
                    </Button>
                  )}
                  {o.status === 'Sent' && (
                    <Button size="sm" variant="secondary" onClick={() => { updateOfferStatus(o.id, 'Digitally Signed'); toast.success('Digitally signed on-chain'); }}>
                      <FileSignature className="h-4 w-4 mr-1" /> Sign
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Offer Letter Preview · {preview?.id}</DialogTitle></DialogHeader>
          {preview && (
            <div className="border border-border rounded-lg p-6 bg-card text-sm leading-relaxed font-display">
              <div className="text-center pb-4 border-b border-border">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Employees' State Insurance Corporation</div>
                <div className="font-semibold text-lg mt-1">Letter of Appointment</div>
                <div className="text-xs text-muted-foreground mt-0.5">Ref: {preview.id} · Date: {new Date(preview.issuedAt).toLocaleDateString()}</div>
              </div>
              <p className="mt-4">Dear <strong>{preview.candidateName}</strong>,</p>
              <p className="mt-2">We are pleased to offer you the position of <strong>{preview.post}</strong> at ESIC, on Pay Matrix <strong>{preview.payLevel}</strong>. Your tentative date of joining is <strong>{new Date(preview.joiningDate).toLocaleDateString()}</strong>.</p>
              <p className="mt-2 text-muted-foreground text-xs">This offer is governed by ESIC (Officers and Staff) Recruitment Rules, 2015, and is subject to satisfactory verification of credentials.</p>
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium">Authorised Signatory</div>
                  <div className="text-muted-foreground mt-0.5">Director General, ESIC</div>
                </div>
                <div className="font-mono text-success bg-success-soft border border-success/30 rounded px-2 py-1">SHA · 0x9f3a...d21c</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
            <Button onClick={() => toast.success('Offer PDF downloaded')}><Download className="h-4 w-4 mr-1.5" /> Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
