import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGetAdminEmailConfigQuery, useUpdateAdminEmailConfigMutation } from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { Mail } from 'lucide-react';

const defaultForm = { smtpHost: '', port: '587', email: '', appPassword: '' };

export function ConfigureEmail() {
  const [form, setForm] = useState(defaultForm);

  const { data: config, isLoading: loadingConfig } = useGetAdminEmailConfigQuery();
  const [updateConfig, { isLoading: saving }] = useUpdateAdminEmailConfigMutation();

  useEffect(() => {
    if (config) {
      setForm({
        smtpHost: config.smtpHost || '',
        port: String(config.port ?? 587),
        email: config.email || '',
        appPassword: '',
      });
    } else if (!loadingConfig) {
      setForm(defaultForm);
    }
  }, [config, loadingConfig]);

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
      toast.error('Email is required');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateConfig({
        smtpHost: form.smtpHost.trim(),
        port: parseInt(form.port, 10),
        email: form.email.trim(),
        appPassword: form.appPassword,
      }).unwrap();
      toast.success('Admin email configuration saved. Subscription and password-reset emails will use this.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save configuration'));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Configure Email</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Set up SMTP for admin emails: new subscription welcome and password reset are sent from this address.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm max-w-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a] flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Admin SMTP settings
          </CardTitle>
          <CardDescription>
            Used when creating a subscription (welcome email) and when resetting a user&apos;s password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-smtpHost">SMTP Host *</Label>
              <Input
                id="admin-smtpHost"
                value={form.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="e.g. smtp.gmail.com"
                disabled={loadingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-port">Port *</Label>
              <Input
                id="admin-port"
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
              <Label htmlFor="admin-email">Email *</Label>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="admin@yourdomain.com"
                disabled={loadingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-appPassword">App Password *</Label>
              <Input
                id="admin-appPassword"
                type="password"
                value={form.appPassword}
                onChange={(e) => handleChange('appPassword', e.target.value)}
                placeholder="SMTP / App password"
                disabled={loadingConfig}
              />
              <p className="text-xs text-slate-500">
                Use an app-specific password. For Gmail: enable 2-Step Verification and create an App Password.
              </p>
            </div>
            <Button type="submit" disabled={saving || loadingConfig} className="bg-[#0f172a] hover:bg-[#1e293b]">
              {saving ? 'Saving…' : 'Save configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
