import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

function CopyableRow({ label, value }) {
  const handleCopy = () => {
    if (value && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2 min-w-0 max-w-[70%]">
        <code className="text-sm font-mono bg-slate-100 px-2 py-1.5 rounded truncate block" title={value}>
          {value || '—'}
        </code>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function SubscriptionCredentialsModal({ open, onOpenChange, title, description, fullName, username, password }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <CopyableRow label="Full Name" value={fullName} />
          <CopyableRow label="Username" value={username} />
          <CopyableRow label="Password" value={password} />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
