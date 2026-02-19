import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, LucideTrash2 as Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export function BillingPlanDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    addons: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        cost: initialData.cost,
        addons: initialData.addons.length > 0 ? initialData.addons : [],
      });
    } else {
      setFormData({
        name: '',
        cost: 0,
        addons: [],
      });
    }
  }, [initialData, open]);

  const handleAddAddon = () => {
    setFormData({
      ...formData,
      addons: [...formData.addons, { name: '', cost: 0 }],
    });
  };

  const handleRemoveAddon = (index) => {
    setFormData({
      ...formData,
      addons: formData.addons.filter((_, i) => i !== index),
    });
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    setFormData({ ...formData, addons: newAddons });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', cost: 0, addons: [] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Billing Plan' : 'Create New Billing Plan'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update billing plan details' : 'Set up a new pricing plan with optional add-ons'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-4 py-4">
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
                <Label htmlFor="cost">Base Cost (₹) *</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Additional Costs (Add-ons)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddAddon}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Add-on
                  </Button>
                </div>

                {formData.addons.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-lg">
                    No add-ons added yet. Click "Add Add-on" to include extra features.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.addons.map((addon, index) => (
                      <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`addon-name-${index}`} className="text-sm">
                            Add-on Name
                          </Label>
                          <Input
                            id={`addon-name-${index}`}
                            value={addon.name}
                            onChange={(e) => handleAddonChange(index, 'name', e.target.value)}
                            placeholder="e.g., Extra Storage, Priority Support"
                            required
                          />
                        </div>
                        <div className="w-32 space-y-2">
                          <Label htmlFor={`addon-cost-${index}`} className="text-sm">
                            Cost (₹)
                          </Label>
                          <Input
                            id={`addon-cost-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={addon.cost}
                            onChange={(e) => handleAddonChange(index, 'cost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveAddon(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.addons.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm">
                    <strong>Total Cost:</strong> ₹
                    {(formData.cost + formData.addons.reduce((sum, addon) => sum + addon.cost, 0)).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
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
