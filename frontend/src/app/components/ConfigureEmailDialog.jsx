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
import {
  useGetEmailConfigQuery,
  useSaveEmailConfigMutation,
  useSendTestEmailMutation,
  useGetSubscriptionsQuery,
} from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { Mail } from 'lucide-react';

const defaultForm = {
  smtpHost: '',
  port: '587',
  email: '',
  appPassword: '',
};

export function ConfigureEmailDialog({ open, onOpenChange, subscriptionId }) {
  const [form, setForm] = useState(defaultForm);
  const [showTestSection, setShowTestSection] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');

  const { data: config, isLoading: loadingConfig } = useGetEmailConfigQuery(subscriptionId, {
    skip: !open || !subscriptionId,
  });
  const { data: subscriptions = [] } = useGetSubscriptionsQuery(undefined, { skip: !open });
  const [saveConfig, { isLoading: saving }] = useSaveEmailConfigMutation();
  const [sendTest, { isLoading: sendingTest }] = useSendTestEmailMutation();

  const subscriptionName = subscriptions.find((s) => s.id === subscriptionId)?.fullName ?? '';

  useEffect(() => {
    if (open && config) {
      setForm({
        smtpHost: config.smtpHost || '',
        port: String(config.port ?? 587),
        email: config.email || '',
        appPassword: '',
      });
    } else if (open && !loadingConfig) {
      setForm(defaultForm);
    }
  }, [open, config, loadingConfig]);

  useEffect(() => {
    if (!open) {
      setShowTestSection(false);
      setTestRecipient('');
    }
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.smtpHost?.trim()) {
      toast.error('SMTP Host is required');
      return false;
    }
    const portNum = parseInt(form.port, 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      toast.error('Port must be between 1 and 65535');
      return false;
    }
    if (!form.email?.trim()) {
      toast.error('Email ID is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Invalid email format');
      return false;
    }
    if (!form.appPassword?.trim()) {
      toast.error('App Password is required');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await saveConfig({
        subscriptionId,
        smtpHost: form.smtpHost.trim(),
        port: parseInt(form.port, 10),
        email: form.email.trim(),
        appPassword: form.appPassword,
      }).unwrap();
      toast.success('Email configuration saved successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save email configuration'));
    }
  };

  const handleSendTest = async () => {
    const to = testRecipient.trim();
    if (!to) {
      toast.error('Enter recipient email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      toast.error('Invalid recipient email format');
      return;
    }
    try {
      await sendTest({ subscriptionId, to }).unwrap();
      toast.success('Test email sent successfully');
      setShowTestSection(false);
      setTestRecipient('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send test email'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Configure Email
          </DialogTitle>
          <DialogDescription>
            SMTP settings for {subscriptionName || 'this subscriber'}. App password is stored encrypted.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                value={form.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="e.g. smtp.gmail.com"
                disabled={loadingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port *</Label>
              <Input
                id="port"
                type="number"
                min={1}
                max={65535}
                value={form.port}
                onChange={(e) => handleChange('port', e.target.value)}
                placeholder="587"
                disabled={loadingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                disabled={loadingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appPassword">App Password *</Label>
              <Input
                id="appPassword"
                type="password"
                value={form.appPassword}
                onChange={(e) => handleChange('appPassword', e.target.value)}
                placeholder="SMTP / App password"
                disabled={loadingConfig}
              />
              <p className="text-xs text-slate-500">
                Use an app-specific password from your email provider. Stored encrypted.
              </p>
            </div>

            {showTestSection && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <Label>Send test email to</Label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendTest}
                    disabled={sendingTest}
                  >
                    {sendingTest ? 'Sending…' : 'Send'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTestSection(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTestSection((v) => !v)}
              disabled={!form.smtpHost?.trim() || !form.email?.trim()}
            >
              {showTestSection ? 'Hide Test Mail' : 'Test Mail'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={saving || loadingConfig}>
              {saving ? 'Saving…' : 'Save configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
