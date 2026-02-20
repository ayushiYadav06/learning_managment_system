import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useGetModulesQuery } from '../store/services/lmsApi';

const USERS_OPTIONS = [500, 1000, 1500, 2000, 2500, 3000];
const INSTALLATION_COST_PRESETS = [
  { value: 50000, label: '₹50,000 (50k)' },
  { value: 100000, label: '₹1,00,000 (1 Lakh)' },
  { value: 150000, label: '₹1,50,000 (1.5 Lakh)' },
  { value: 200000, label: '₹2,00,000 (2 Lakh)' },
];

export function BillingPlanDialog({ open, onOpenChange, onSubmit, initialData }) {
  const { data: masters = [] } = useGetModulesQuery(undefined, { skip: !open });
  const [formData, setFormData] = useState({
    name: '',
    masterIds: [],
    users: 500,
    afterExceedLimitPerUser: 0,
    cost: 50000,
    planCost: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? '',
        masterIds: initialData.masterIds?.length ? [...initialData.masterIds] : [],
        users: initialData.users ?? 500,
        afterExceedLimitPerUser: initialData.afterExceedLimitPerUser ?? 0,
        cost: initialData.cost ?? 50000,
        planCost: initialData.planCost ?? 0,
      });
    } else {
      setFormData({
        name: '',
        masterIds: [],
        users: 500,
        afterExceedLimitPerUser: 0,
        cost: 50000,
        planCost: 0,
      });
    }
  }, [initialData, open]);

  const handleToggleMaster = (masterId) => {
    setFormData((prev) => ({
      ...prev,
      masterIds: prev.masterIds.includes(masterId)
        ? prev.masterIds.filter((id) => id !== masterId)
        : [...prev.masterIds, masterId],
    }));
  };

  const installationCostOptions = useMemo(() => {
    const current = formData.cost ?? initialData?.cost;
    if (current && !INSTALLATION_COST_PRESETS.some((p) => p.value === current)) {
      return [
        ...INSTALLATION_COST_PRESETS,
        { value: current, label: `₹${Number(current).toLocaleString()} (saved)` },
      ];
    }
    return INSTALLATION_COST_PRESETS;
  }, [formData.cost, initialData?.cost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      masterIds: formData.masterIds,
      users: formData.users,
      afterExceedLimitPerUser: Number(formData.afterExceedLimitPerUser) || 0,
      cost: formData.cost,
      planCost: Number(formData.planCost) || 0,
      addons: [],
    });
    setFormData({
      name: '',
      masterIds: [],
      users: 500,
      afterExceedLimitPerUser: 0,
      cost: 50000,
      planCost: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] min-h-0 flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>{initialData ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update plan details' : 'Set up a new plan with modules, users limit, and installation cost'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 flex overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6">
            <div className="space-y-4 py-4 pb-2">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Plan, Premium Plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modules</Label>
                <p className="text-xs text-slate-500">Select all modules included in this plan</p>
                <div className="border rounded-lg p-3 max-h-[160px] overflow-y-auto space-y-2 bg-slate-50/50">
                  {masters.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2">No modules available. Create modules first.</p>
                  ) : (
                    masters.map((master) => (
                      <div
                        key={master.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100/80"
                      >
                        <Checkbox
                          id={master.id}
                          checked={formData.masterIds.includes(master.id)}
                          onCheckedChange={() => handleToggleMaster(master.id)}
                        />
                        <Label htmlFor={master.id} className="cursor-pointer font-normal text-sm flex-1">
                          {master.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="users">Users *</Label>
                <Select
                  value={String(formData.users)}
                  onValueChange={(v) => setFormData({ ...formData, users: Number(v) })}
                >
                  <SelectTrigger id="users">
                    <SelectValue placeholder="Select user limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {USERS_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterExceedLimitPerUser">After Exceed Limit Per User (₹) *</Label>
                <Input
                  id="afterExceedLimitPerUser"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.afterExceedLimitPerUser === 0 ? '' : formData.afterExceedLimitPerUser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      afterExceedLimitPerUser: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="Enter amount per user after limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planCost">Plan Cost *</Label>
                <Input
                  id="planCost"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.planCost === 0 ? '' : formData.planCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      planCost: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="Enter plan cost"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Installation Cost *</Label>
                <Select
                  value={String(formData.cost)}
                  onValueChange={(v) => setFormData({ ...formData, cost: Number(v) })}
                >
                  <SelectTrigger id="cost">
                    <SelectValue placeholder="Select installation cost" />
                  </SelectTrigger>
                  <SelectContent side="top" position="popper" sideOffset={4}>
                    {installationCostOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
