import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Pencil, LucideTrash2 as Trash2, Users, DollarSign, Search } from 'lucide-react';
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
import { Pagination, PAGE_SIZE } from '../components/ui/pagination';

function calculateTotalCost(plan) {
  const addonTotal = plan.addons.reduce((sum, addon) => sum + addon.cost, 0);
  return plan.cost + addonTotal;
}

export function Billing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: plans = [], isLoading, error } = useGetBillingPlansQuery();

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [plans, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE));
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPlans.slice(start, start + PAGE_SIZE);
  }, [filteredPlans, currentPage]);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Billing Plans</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage subscription pricing and plans</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={isCreating || isUpdating}
          className="bg-[#0f172a] hover:bg-[#1e293b] shadow-sm h-10 px-5 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Billing Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a]">All Billing Plans</CardTitle>
          <CardDescription className="text-sm">View and manage all pricing plans</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">Loading...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-700 font-medium">
                {searchQuery.trim() ? 'No matching plans' : 'No billing plans found'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery.trim() ? 'Try a different search' : 'Create your first plan to get started'}
              </p>
              {!searchQuery.trim() && (
                <Button
                  variant="outline"
                  className="mt-5 h-10 px-4 rounded-lg border-slate-200 text-[#0f172a] hover:bg-slate-100"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create First Plan
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by plan name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 border-slate-200 rounded-md"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Base Cost</TableHead>
                    <TableHead>Add-ons</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right w-[1%] whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-[#0f172a]">{plan.name}</TableCell>
                    <TableCell className="text-slate-600">₹{plan.cost.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">
                      {plan.addons.length > 0 ? (
                        <div className="space-y-0.5">
                          {plan.addons.map((addon, idx) => (
                            <div key={idx} className="text-sm">
                              {addon.name}: ₹{addon.cost}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-[#0f172a]">
                      ₹{calculateTotalCost(plan).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[#0f172a]/10 text-[#0f172a] border-[#0f172a]/20 text-xs">
                        {plan.subscriptionCount ?? 0} assigned
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 rounded-md border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-medium"
                          onClick={() => handleAssignSubscriptions(plan.id)}
                        >
                          <Users className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 rounded-md border-slate-200 text-[#0f172a] hover:bg-slate-50"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 rounded-md"
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredPlans.length}
                pageSize={PAGE_SIZE}
              />
            </>
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
