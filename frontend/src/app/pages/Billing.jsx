import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Pencil, LucideTrash2 as Trash2, Users, DollarSign } from 'lucide-react';
import {
  useGetBillingPlansQuery,
  useCreateBillingPlanMutation,
  useUpdateBillingPlanMutation,
  useDeleteBillingPlanMutation,
} from '../store/services/lmsApi';
import { BillingPlanDialog } from '../components/BillingPlanDialog';
import { AssignSubscriptionsDialog } from '../components/AssignSubscriptionsDialog';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../config/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

function calculateTotalCost(plan) {
  const addonTotal = plan.addons.reduce((sum, addon) => sum + addon.cost, 0);
  return plan.cost + addonTotal;
}

export function Billing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans = [], isLoading, error } = useGetBillingPlansQuery();
  const [createBillingPlan, { isLoading: isCreating }] = useCreateBillingPlanMutation();
  const [updateBillingPlan, { isLoading: isUpdating }] = useUpdateBillingPlanMutation();
  const [deleteBillingPlan, { isLoading: isDeleting }] = useDeleteBillingPlanMutation();

  const handleCreatePlan = async (data) => {
    try {
      await createBillingPlan(data).unwrap();
      setIsDialogOpen(false);
      toast.success('Billing plan created successfully');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to create billing plan'));
    }
  };

  const handleUpdatePlan = async (data) => {
    if (!editingPlan) return;
    try {
      await updateBillingPlan({ id: editingPlan.id, data }).unwrap();
      setEditingPlan(null);
      setIsDialogOpen(false);
      toast.success('Billing plan updated successfully');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update billing plan'));
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the ${name} plan?`)) return;
    try {
      await deleteBillingPlan(id).unwrap();
      toast.success('Billing plan deleted');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete billing plan'));
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
  };

  const handleAssignSubscriptions = (planId) => {
    setSelectedPlan(planId);
    setIsAssignDialogOpen(true);
  };

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load billing plans'));
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Billing Plans</h2>
          <p className="text-gray-500 mt-1">Manage subscription pricing and plans</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isCreating || isUpdating}>
          <Plus className="w-4 h-4 mr-2" />
          New Billing Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Billing Plans</CardTitle>
          <CardDescription>View and manage all pricing plans</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No billing plans found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Create First Plan
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Base Cost</TableHead>
                    <TableHead>Add-ons</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>₹{plan.cost.toLocaleString()}</TableCell>
                      <TableCell>
                        {plan.addons.length > 0 ? (
                          <div className="space-y-1">
                            {plan.addons.map((addon, idx) => (
                              <div key={idx} className="text-sm">
                                {addon.name}: ₹{addon.cost}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{calculateTotalCost(plan).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {plan.subscriptionCount ?? 0} assigned
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignSubscriptions(plan.id)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(plan)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillingPlanDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
        initialData={editingPlan ?? undefined}
      />

      {selectedPlan && (
        <AssignSubscriptionsDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          planId={selectedPlan}
        />
      )}
    </div>
  );
}
