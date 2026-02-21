import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useGetModulesQuery } from '../store/services/lmsApi';
import { ChevronDown, X, Check } from 'lucide-react';

const USER_ADD_OPTIONS = [500, 1000, 1500];
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
    userChips: [500],
    afterExceedLimitPerUser: 0,
    cost: 50000,
    planCost: 0,
  });
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const modulesDropdownRef = useRef(null);
  const moduleSearchInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const users = initialData.users ?? 500;
      setFormData({
        name: initialData.name ?? '',
        masterIds: initialData.masterIds?.length ? [...initialData.masterIds] : [],
        userChips: users > 0 ? [users] : [500],
        afterExceedLimitPerUser: initialData.afterExceedLimitPerUser ?? 0,
        cost: initialData.cost ?? 50000,
        planCost: initialData.planCost ?? 0,
      });
    } else {
      setFormData({
        name: '',
        masterIds: [],
        userChips: [500],
        afterExceedLimitPerUser: 0,
        cost: 50000,
        planCost: 0,
      });
    }
  }, [initialData, open]);

  const filteredMasters = useMemo(() => {
    const q = (moduleSearch || '').trim().toLowerCase();
    if (!q) return masters;
    return masters.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.module_code || '').toLowerCase().includes(q)
    );
  }, [masters, moduleSearch]);

  useEffect(() => {
    if (!modulesDropdownOpen) return;
    setModuleSearch('');
    moduleSearchInputRef.current?.focus();
  }, [modulesDropdownOpen]);

  useEffect(() => {
    if (!modulesDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (modulesDropdownRef.current && !modulesDropdownRef.current.contains(e.target)) {
        setModulesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modulesDropdownOpen]);

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

  const usersTotal = formData.userChips.reduce((a, b) => a + b, 0) || 500;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      masterIds: formData.masterIds,
      users: usersTotal,
      afterExceedLimitPerUser: Number(formData.afterExceedLimitPerUser) || 0,
      cost: formData.cost,
      planCost: Number(formData.planCost) || 0,
      addons: [],
    });
    setFormData({
      name: '',
      masterIds: [],
      userChips: [500],
      afterExceedLimitPerUser: 0,
      cost: 50000,
      planCost: 0,
    });
  };

  const addUserChip = (value) => {
    setFormData((prev) => ({
      ...prev,
      userChips: [...prev.userChips, value],
    }));
  };

  const removeUserChip = (index) => {
    setFormData((prev) => {
      const next = prev.userChips.filter((_, i) => i !== index);
      return { ...prev, userChips: next.length > 0 ? next : [500] };
    });
  };

  const removeModuleAt = (index) => {
    setFormData((prev) => {
      const next = prev.masterIds.filter((_, i) => i !== index);
      return { ...prev, masterIds: next };
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

              <div className="space-y-2" ref={modulesDropdownRef}>
                <Label>Modules</Label>
                <p className="text-xs text-slate-500">Type to search and click to add. Selected modules appear by name below.</p>
                <div className="relative">
                  <div
                    className="flex flex-wrap items-center gap-2 min-h-[42px] rounded-md border border-slate-200 bg-white px-3 py-2 cursor-text"
                    onClick={() => { setModulesDropdownOpen(true); moduleSearchInputRef.current?.focus(); }}
                  >
                    {formData.masterIds.map((masterId) => {
                      const master = masters.find((m) => m.id === masterId);
                      const label = master ? (master.module_code ? `${master.name} (${master.module_code})` : master.name) : masterId;
                      return (
                        <span
                          key={masterId}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-800 shrink-0"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeModuleAt(formData.masterIds.indexOf(masterId)); }}
                            className="rounded p-0.5 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label={`Remove ${label}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      );
                    })}
                    <input
                      ref={moduleSearchInputRef}
                      type="text"
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                      onFocus={() => setModulesDropdownOpen(true)}
                      placeholder={formData.masterIds.length === 0 ? 'Search modules by name or code...' : 'Search more...'}
                      className="flex-1 min-w-[120px] min-h-[28px] border-0 bg-transparent px-1 py-0.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModulesDropdownOpen((o) => !o); }}
                      className="flex items-center rounded p-1 text-slate-500 hover:bg-slate-100 shrink-0"
                      aria-label="Toggle modules list"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  {modulesDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-[220px] overflow-y-auto">
                      <div className="p-1">
                        {masters.length === 0 ? (
                          <p className="py-2 px-2 text-sm text-slate-500">No modules available. Create modules first.</p>
                        ) : filteredMasters.length === 0 ? (
                          <p className="py-2 px-2 text-sm text-slate-500">No modules match &quot;{moduleSearch}&quot;</p>
                        ) : (
                          filteredMasters.map((master) => {
                            const isChecked = formData.masterIds.includes(master.id);
                            return (
                              <div
                                key={master.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleToggleMaster(master.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleToggleMaster(master.id);
                                  }
                                }}
                                className="flex items-center space-x-3 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-slate-100"
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs ${
                                    isChecked ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-300'
                                  }`}
                                >
                                  {isChecked ? <Check className="h-3.5 w-3.5" /> : null}
                                </span>
                                <span className="flex-1 text-left">
                                  {master.module_code ? `${master.name} (${master.module_code})` : master.name}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="users">Users *</Label>
                <p className="text-xs text-slate-500">Add user counts below; total is used as the limit. Remove with × if needed.</p>
                <div className="min-h-[42px] flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                  {formData.userChips.map((val, index) => (
                    <span
                      key={`${index}-${val}`}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-800"
                    >
                      {val.toLocaleString()}
                      <button
                        type="button"
                        onClick={() => removeUserChip(index)}
                        className="rounded p-0.5 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        aria-label={`Remove ${val}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {USER_ADD_OPTIONS.map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-md border-slate-200 text-slate-700 hover:bg-slate-50"
                      onClick={() => addUserChip(n)}
                    >
                      +{n.toLocaleString()}
                    </Button>
                  ))}
                </div>
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
