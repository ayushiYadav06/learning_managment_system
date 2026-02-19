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
  useGetSubscriptionsQuery,
  useGetAssignedSubscriptionsQuery,
  useGetBillingPlansQuery,
  useAssignSubscriptionsToPlanMutation,
} from '../store/services/lmsApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

function getTypeBadgeColor(type) {
  switch (type) {
    case 'Individual':
      return 'bg-blue-100 text-blue-700';
    case 'Hybrid':
      return 'bg-purple-100 text-purple-700';
    case 'Institute/School':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function AssignSubscriptionsDialog({ open, onOpenChange, planId }) {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);

  const { data: subscriptions = [] } = useGetSubscriptionsQuery(undefined, { skip: !open });
  const { data: assignedIds = [] } = useGetAssignedSubscriptionsQuery(planId, {
    skip: !open || !planId,
  });
  const { data: plans = [] } = useGetBillingPlansQuery(undefined, { skip: !open });
  const [assignSubscriptions, { isLoading }] = useAssignSubscriptionsToPlanMutation();

  const planName = useMemo(
    () => plans.find((p) => p.id === planId)?.name ?? '',
    [plans, planId]
  );

  useEffect(() => {
    if (open) setSelectedSubscriptions(assignedIds);
  }, [open, assignedIds]);

  const handleToggleSubscription = (subscriptionId) => {
    setSelectedSubscriptions((prev) =>
      prev.includes(subscriptionId)
        ? prev.filter((id) => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  const handleSubmit = async () => {
    try {
      await assignSubscriptions({ planId, subscriptionIds: selectedSubscriptions }).unwrap();
      toast.success(`Subscriptions assigned successfully to ${planName}`);
      onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to assign subscriptions'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Assign Subscriptions</DialogTitle>
          <DialogDescription>
            Select subscriptions to assign to {planName}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3 py-4">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subscriptions available. Please create subscriptions first.
              </div>
            ) : (
              subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={subscription.id}
                    checked={selectedSubscriptions.includes(subscription.id)}
                    onCheckedChange={() => handleToggleSubscription(subscription.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={subscription.id} className="cursor-pointer font-medium">
                        {subscription.fullName}
                      </Label>
                      <Badge className={getTypeBadgeColor(subscription.type)}>
                        {subscription.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Email: {subscription.email}</div>
                      <div>Username: {subscription.username}</div>
                    </div>
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
          <Button
            onClick={handleSubmit}
            disabled={subscriptions.length === 0 || isLoading}
          >
            Assign Subscriptions ({selectedSubscriptions.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
