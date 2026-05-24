import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', subtitle, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground max-w-md">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
