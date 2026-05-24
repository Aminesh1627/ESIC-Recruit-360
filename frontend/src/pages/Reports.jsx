import React from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer, TrendingUp, Users2, Briefcase, Award, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

export default function ReportsPage() {
  const { db } = useStore();
  const { t } = useLang();

  const reports = [
    { name: 'Vacancy Status Report', desc: 'Status-wise distribution across all departments', icon: Briefcase },
    { name: 'Candidate Demographics', desc: 'Category, age & gender analysis', icon: Users2 },
    { name: 'Recruitment Funnel Conversion', desc: 'Stage-wise drop-off across pipeline', icon: TrendingUp },
    { name: 'Merit & Selection Outcomes', desc: 'Final merit by post & category', icon: Trophy },
    { name: 'SLA Compliance Report', desc: 'Approval TAT and adherence', icon: Award },
    { name: 'Grievance Resolution Summary', desc: 'Type, priority and resolution TAT', icon: FileSpreadsheet },
  ];

  const deptData = ['ESIC HQ', 'Medical Division', 'Revenue', 'IT Division', 'HR & Administration', 'Finance'].map(d => ({
    dept: d,
    count: db.vacancies.filter(v => v.department === d).length,
  }));

  return (
    <div>
      <PageHeader title={t('reports')} subtitle="Enterprise reporting suite · Export PDF/Excel/Print" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Open Reports" value="23" icon={FileSpreadsheet} tone="primary" />
        <KpiCard label="Scheduled" value="7" icon={Printer} tone="secondary" />
        <KpiCard label="Saved Filters" value="42" icon={Award} tone="accent" />
        <KpiCard label="Exports (30d)" value="189" icon={Download} tone="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold mb-3">Vacancies by Department</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={deptData} layout="vertical" margin={{ left: 30, top: 5, right: 10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="hsl(220 81% 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold mb-3">Status Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={['Draft', 'Submitted', 'Under Review', 'Approved', 'Published'].map((s, i) => ({
                  name: s, value: db.vacancies.filter(v => v.status === s).length
                }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {['hsl(220 12% 70%)', 'hsl(239 84% 67%)', 'hsl(38 92% 50%)', 'hsl(149 70% 40%)', 'hsl(220 81% 45%)'].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {reports.map(r => (
          <Card key={r.name} className="p-5 hover:border-primary transition-colors flex flex-col">
            <div className="h-10 w-10 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-3"><r.icon className="h-5 w-5" /></div>
            <div className="font-display text-base font-semibold">{r.name}</div>
            <p className="text-xs text-muted-foreground mt-1 flex-1">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${r.name} exported as PDF`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${r.name} exported as Excel`)}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Excel
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success('Sent to printer (mock)')}>
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
