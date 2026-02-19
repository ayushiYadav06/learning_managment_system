import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useGetSubscriptionDetailsQuery } from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { ArrowLeft, User, Mail, Phone, Key, Package, DollarSign, Copy } from 'lucide-react';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  try {
    return d.toLocaleString();
  } catch {
    return d.toISOString ? d.toISOString().slice(0, 16).replace('T', ' ') : String(d);
  }
}

function DetailRow({ icon: Icon, label, value, copyable }) {
  const handleCopy = () => {
    if (value && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 text-slate-600">
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        <span className="font-medium text-[#0f172a]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-700">{value ?? '—'}</span>
        {copyable && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSubscriptionDetailsQuery(id, { skip: !id });

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load subscriber details'));
  }, [error]);

  if (!id) {
    navigate('/dashboard/subscriptions');
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="text-[#0f172a]" onClick={() => navigate('/dashboard/subscriptions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Button>
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!data?.subscription) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="text-[#0f172a]" onClick={() => navigate('/dashboard/subscriptions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Button>
        <div className="text-center py-12 text-slate-500">Subscriber not found</div>
      </div>
    );
  }

  const { subscription, assignedModules = [], billingPlans = [] } = data;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="text-[#0f172a] hover:bg-slate-100"
        onClick={() => navigate('/dashboard/subscriptions')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Subscriptions
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">{subscription.fullName}</h2>
        <p className="text-slate-500 mt-1">Complete user details, modules enrolled & billing enrolled</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
            <User className="w-5 h-5" />
            Complete profile
          </CardTitle>
          <CardDescription>All user information and login credentials</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-0">
            <DetailRow icon={User} label="Full Name" value={subscription.fullName} />
            <DetailRow icon={Mail} label="Email" value={subscription.email} copyable />
            <DetailRow icon={Phone} label="Mobile" value={subscription.mobile} />
            <DetailRow
              icon={User}
              label="Username"
              value={subscription.username}
              copyable
            />
            <DetailRow
              icon={Key}
              label="Password"
              value={subscription.password}
              copyable
            />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-slate-600">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-[#0f172a]">Type</span>
              </div>
              <Badge className="bg-[#0f172a]/10 text-[#0f172a] border-[#0f172a]/20">
                {subscription.type}
              </Badge>
            </div>
            {subscription.createdAt && (
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <span className="font-medium text-[#0f172a]">Created</span>
                <span className="text-slate-600">
                  {formatDateTime(subscription.createdAt)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
            <Package className="w-5 h-5" />
            Modules enrolled
          </CardTitle>
          <CardDescription>All modules this user is enrolled in</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {assignedModules.length === 0 ? (
            <p className="text-slate-500 py-4">Not enrolled in any modules</p>
          ) : (
            <ul className="space-y-3">
              {assignedModules.map((mod) => (
                <li
                  key={mod.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <p className="font-medium text-[#0f172a]">{mod.name}</p>
                  {mod.description && (
                    <p className="text-sm text-slate-500 mt-1">{mod.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Billing enrolled
          </CardTitle>
          <CardDescription>All billing plans this user is enrolled in</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {billingPlans.length === 0 ? (
            <p className="text-slate-500 py-4">Not enrolled in any billing plan</p>
          ) : (
            <ul className="space-y-3">
              {billingPlans.map((plan) => (
                <li
                  key={plan.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div>
                    <p className="font-medium text-[#0f172a]">{plan.name}</p>
                    <p className="text-sm text-slate-500">
                      Base: ₹{plan.cost?.toLocaleString?.() ?? plan.cost}
                      {plan.addons?.length > 0 && (
                        <> · Add-ons: {plan.addons.map((a) => a.name).join(', ')}</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-[#0f172a]"
                    onClick={() => navigate(`/dashboard/billing`)}
                  >
                    View plan
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
