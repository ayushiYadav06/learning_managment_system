import React, { useState, useMemo, useEffect } from 'react';
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
  useGetModulesQuery,
  useGetAssignedModulesQuery,
  useGetSubscriptionsQuery,
  useAssignModulesMutation,
} from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { ScrollArea } from './ui/scroll-area';

export function AssignModulesDialog({ open, onOpenChange, subscriptionId }) {
  const [selectedModules, setSelectedModules] = useState([]);

  const { data: modules = [] } = useGetModulesQuery(undefined, { skip: !open });
  const { data: assignedIds = [] } = useGetAssignedModulesQuery(subscriptionId, {
    skip: !open || !subscriptionId,
  });
  const { data: subscriptions = [] } = useGetSubscriptionsQuery(undefined, { skip: !open });
  const [assignModules, { isLoading }] = useAssignModulesMutation();

  const subscriptionName = useMemo(
    () => subscriptions.find((s) => s.id === subscriptionId)?.fullName ?? '',
    [subscriptions, subscriptionId]
  );

  useEffect(() => {
    if (open) setSelectedModules(assignedIds);
  }, [open, assignedIds]);

  const handleToggleModule = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSubmit = async () => {
    try {
      await assignModules({ subscriptionId, moduleIds: selectedModules }).unwrap();
      toast.success(`Modules assigned successfully to ${subscriptionName}`);
      onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to assign modules'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Modules</DialogTitle>
          <DialogDescription>Select modules to assign to {subscriptionName}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 py-4">
            {modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No modules available. Please create modules first.
              </div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleToggleModule(module.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={module.id} className="cursor-pointer font-medium">
                      {module.name}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={modules.length === 0 || isLoading}>
            Assign Modules ({selectedModules.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
