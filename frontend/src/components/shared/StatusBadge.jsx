import React from 'react';
import { cn } from '@/lib/utils';

const MAP = {
  // Vacancy
  'Draft':              'bg-muted text-muted-foreground border-border',
  'Submitted':          'bg-pending-soft text-pending border-pending/30',
  'Under Review':       'bg-warning-soft text-warning border-warning/30',
  'Finance Review':     'bg-warning-soft text-warning border-warning/30',
  'Reservation Review': 'bg-warning-soft text-warning border-warning/30',
  'Approved':           'bg-success-soft text-success border-success/30',
  'Published':          'bg-secondary-soft text-secondary border-secondary/30',
  'Closed':             'bg-muted text-muted-foreground border-border',

  // App
  'Eligible':           'bg-success-soft text-success border-success/30',
  'Shortlisted':        'bg-success-soft text-success border-success/30',
  'Borderline':         'bg-warning-soft text-warning border-warning/30',
  'Rejected':           'bg-destructive-soft text-destructive border-destructive/30',

  // DV
  'Pending':            'bg-pending-soft text-pending border-pending/30',
  'Verified':           'bg-success-soft text-success border-success/30',
  'Deficient':          'bg-warning-soft text-warning border-warning/30',
  'Fraud Suspected':    'bg-destructive-soft text-destructive border-destructive/30',

  // Interview
  'Scheduled':          'bg-primary-soft text-primary border-primary/30',
  'In Progress':        'bg-pending-soft text-pending border-pending/30',
  'Completed':          'bg-success-soft text-success border-success/30',
  'No Show':            'bg-destructive-soft text-destructive border-destructive/30',

  // Grievance
  'Open':               'bg-pending-soft text-pending border-pending/30',
  'Assigned':           'bg-primary-soft text-primary border-primary/30',
  'In Review':          'bg-warning-soft text-warning border-warning/30',
  'Resolved':           'bg-success-soft text-success border-success/30',

  // Offer
  'Sent':               'bg-primary-soft text-primary border-primary/30',
  'Digitally Signed':   'bg-secondary-soft text-secondary border-secondary/30',
  'Accepted':           'bg-success-soft text-success border-success/30',
  'Declined':           'bg-destructive-soft text-destructive border-destructive/30',
  'Extension Requested':'bg-warning-soft text-warning border-warning/30',

  // Priority
  'High':               'bg-destructive-soft text-destructive border-destructive/30',
  'Medium':             'bg-warning-soft text-warning border-warning/30',
  'Low':                'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status, className, dot = true }) {
  const klass = MAP[status] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', klass, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {status}
    </span>
  );
}
