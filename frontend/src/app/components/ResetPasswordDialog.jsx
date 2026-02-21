import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function ResetPasswordDialog({ open, onOpenChange, subscriptionName, subscriptionEmail, onConfirm }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (open && subscriptionEmail) setEmail(subscriptionEmail);
  }, [open, subscriptionEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Enter the email address where the new password should be sent. A new password will be generated and emailed from your configured admin email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Send new password to *</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              {subscriptionName && (
                <p className="text-xs text-slate-500">Subscription: {subscriptionName}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Reset &amp; send email</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
