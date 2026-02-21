import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  useGetBillingPlansQuery,
  useGetSubscriptionPlanAssignmentsQuery,
  useGetSubscriptionsQuery,
  useAssignSubscriptionPlansMutation,
} from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { Key } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: '4-month', label: '4 Month' },
  { value: '8-month', label: '8 Month' },
  { value: '12-month', label: '12 Month' },
  { value: '2-year', label: '2 Year' },
  { value: '4-year', label: '4 Year' },
];

function addDuration(startDate, duration) {
  const d = new Date(startDate);
  switch (duration) {
    case '4-month':
      d.setMonth(d.getMonth() + 4);
      return d;
    case '8-month':
      d.setMonth(d.getMonth() + 8);
      return d;
    case '12-month':
      d.setFullYear(d.getFullYear() + 1);
      return d;
    case '2-year':
      d.setFullYear(d.getFullYear() + 2);
      return d;
    case '4-year':
      d.setFullYear(d.getFullYear() + 4);
      return d;
    default:
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
}

export function AssignPlansDialog({ open, onOpenChange, subscriptionId }) {
  const [selected, setSelected] = useState({});
  const openedRef = useRef(false);

  const { data: plans = [] } = useGetBillingPlansQuery(undefined, { skip: !open });
  const { data: existingAssignments = [] } = useGetSubscriptionPlanAssignmentsQuery(subscriptionId, {
    skip: !open || !subscriptionId,
  });
  const { data: subscriptions = [] } = useGetSubscriptionsQuery(undefined, { skip: !open });
  const [assignPlans, { isLoading }] = useAssignSubscriptionPlansMutation();

  const subscriptionName = useMemo(
    () => subscriptions.find((s) => s.id === subscriptionId)?.fullName ?? '',
    [subscriptions, subscriptionId]
  );

  const isUpgrade = existingAssignments.length > 0;
  const currentPlanId = isUpgrade ? existingAssignments[0]?.planId : null;
  const currentPlan = useMemo(
    () => (currentPlanId ? plans.find((p) => p.id === currentPlanId) : null),
    [plans, currentPlanId]
  );
  const selectablePlans = useMemo(() => {
    if (!isUpgrade || !currentPlanId) return plans;
    return plans.filter((p) => p.id !== currentPlanId);
  }, [plans, isUpgrade, currentPlanId]);

  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      setSelected({});
    }
  }, [open, subscriptionId]);

  const handleTogglePlan = (planId, checked) => {
    if (planId === currentPlanId) return;
    if (checked === true) {
      setSelected({ [planId]: '12-month' });
    } else {
      setSelected({});
    }
  };

  const handleDurationChange = (planId, duration) => {
    setSelected((prev) => ({ ...prev, [planId]: duration }));
  };

  const handleSubmit = async () => {
    if (!subscriptionId) {
      toast.error('Subscription not found. Please close and try again.');
      return;
    }
    const entries = Object.entries(selected);
    if (entries.length === 0) {
      toast.error('Select one plan with a duration');
      return;
    }
    const [planId, duration] = entries[0];
    try {
      await assignPlans({ subscriptionId, assignments: [{ planId, duration }] }).unwrap();
      toast.success(
        isUpgrade
          ? `Plan upgraded successfully for ${subscriptionName}. Active from today; API key updated.`
          : `Plan assigned successfully to ${subscriptionName}. API key updated.`
      );
      onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, isUpgrade ? 'Failed to upgrade plan' : 'Failed to assign plan'));
    }
  };

  const selectedEntry = Object.entries(selected)[0];
  const planStartDate = selectedEntry ? new Date() : null;
  const planEndDate = selectedEntry ? addDuration(planStartDate, selectedEntry[1]) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>{isUpgrade ? 'Upgrade Plan' : 'Assign Plan'}</DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? `Select a different plan and duration for ${subscriptionName}. The current plan cannot be selected again. The upgraded plan is active from today.`
              : `Select one plan and duration for ${subscriptionName}. Access starts today and ends after the chosen duration.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6">
          {isUpgrade && currentPlanId && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              Current plan is excluded. Choose a different plan to upgrade.
            </p>
          )}
          <div className="flex items-center gap-2 px-1 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-600 mb-3">
            <Key className="w-4 h-4 shrink-0 text-slate-500" />
            <span>API key: </span>
            <span className="font-mono text-slate-500 select-none">••••••••••••••••••••••••</span>
            <span className="text-slate-400 text-xs">(hidden)</span>
          </div>
          {selectedEntry && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm mb-4">
              <div>
                <span className="text-slate-500 font-medium">Plan start date</span>
                <p className="text-[#0f172a] font-medium mt-0.5">{formatDate(planStartDate)}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Plan end date</span>
                <p className="text-[#0f172a] font-medium mt-0.5">{formatDate(planEndDate)}</p>
              </div>
            </div>
          )}
          <div className="space-y-4 pb-4">
            {currentPlan && (
              <div className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-slate-50 border-slate-200">
                <Checkbox id={`plan-current-${currentPlan.id}`} checked disabled />
                <div className="flex-1 min-w-[140px]">
                  <Label htmlFor={`plan-current-${currentPlan.id}`} className="font-medium text-slate-600 cursor-default">
                    {currentPlan.name}
                  </Label>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Installation: ₹{(currentPlan.cost ?? 0).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">Current plan</span>
              </div>
            )}
            {selectablePlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isUpgrade && currentPlanId
                  ? 'No other plans available to upgrade to.'
                  : 'No plans available. Please create plans first.'}
              </div>
            ) : (
              selectablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`plan-${plan.id}`}
                    checked={selected[plan.id] != null}
                    onCheckedChange={(checked) => handleTogglePlan(plan.id, checked)}
                  />
                  <div className="flex-1 min-w-[140px]">
                    <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer font-medium">
                      {plan.name}
                    </Label>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Installation: ₹{(plan.cost ?? 0).toLocaleString()}
                    </p>
                  </div>
                  {selected[plan.id] && (
                    <div className="w-[160px]">
                      <Label className="text-xs text-slate-500">Duration</Label>
                      <Select
                        value={selected[plan.id]}
                        onValueChange={(v) => handleDurationChange(plan.id, v)}
                      >
                        <SelectTrigger className="h-9 mt-1">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectablePlans.length === 0 || Object.keys(selected).length === 0 || isLoading}>
            {isUpgrade ? 'Upgrade Plan' : 'Assign Plan'} ({Object.keys(selected).length ? 1 : 0})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
