import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, LucideTrash2 as Trash2, ArrowUpCircle, Link2, Eye, EyeOff, Search, Mail, Users } from 'lucide-react';
import {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} from '../store/services/lmsApi';
import { NewSubscriptionDialog } from '../components/NewSubscriptionDialog';
import { AssignPlansDialog } from '../components/AssignPlansDialog';
import { ConfigureEmailDialog } from '../components/ConfigureEmailDialog';
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
import { Pagination, PAGE_SIZE } from '../components/ui/pagination';

const SUBSCRIPTION_TYPES = ['Individual', 'Hybrid', 'Institute/School'];

export function Subscriptions() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedSubscriptionForEmail, setSelectedSubscriptionForEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('Individual');
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: subscriptions = [], isLoading, error } = useGetSubscriptionsQuery();
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();

  const filteredSubscriptions = useMemo(() => {
    const byTab = subscriptions.filter((sub) => sub.type === activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((sub) => (sub.fullName || '').toLowerCase().includes(q));
  }, [subscriptions, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / PAGE_SIZE));
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSubscriptions.slice(start, start + PAGE_SIZE);
  }, [filteredSubscriptions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleCreateSubscription = async (data) => {
    try {
      const created = await createSubscription(data).unwrap();
      setIsNewDialogOpen(false);
      toast.success(`Subscription created for ${data.fullName}`, {
        description: created.password
          ? `Auto-generated password: ${created.password}. You can copy it from the table or subscriber view.`
          : undefined,
      });
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to create subscription'));
    }
  };

  const handleDeleteSubscription = async (id, name) => {
    if (!confirm(`Are you sure you want to delete subscription for ${name}?`)) return;
    try {
      await deleteSubscription(id).unwrap();
      toast.success('Subscription deleted');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete subscription'));
    }
  };

  const handleAssignPlans = (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
    setIsAssignDialogOpen(true);
  };

  const handleConfigureEmail = (subscriptionId) => {
    setSelectedSubscriptionForEmail(subscriptionId);
  };

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load subscriptions'));
  }, [error]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Subscriptions</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage all subscription accounts</p>
        </div>
        <Button
          onClick={() => setIsNewDialogOpen(true)}
          disabled={isCreating}
          className="bg-[#0f172a] hover:bg-[#1e293b] shadow-sm h-10 px-5 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a]">All Subscriptions</CardTitle>
          <CardDescription className="text-sm">View and manage subscriptions by type</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
              <TabsTrigger value="Individual" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm data-[state=active]:border-slate-200/80">
                Individual
              </TabsTrigger>
              <TabsTrigger value="Hybrid" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm data-[state=active]:border-slate-200/80">
                Hybrid
              </TabsTrigger>
              <TabsTrigger value="Institute/School" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm data-[state=active]:border-slate-200/80">
                Institute/School
              </TabsTrigger>
            </TabsList>

            {SUBSCRIPTION_TYPES.map((type) => (
              <TabsContent key={type} value={type} className="mt-6 focus-visible:outline-none">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16 text-slate-500 text-sm">Loading...</div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-16 rounded-xl bg-slate-50/80 border border-slate-200/60">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-700 font-medium">
                      {searchQuery.trim() ? 'No matching subscriptions' : `No ${type} subscriptions found`}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {searchQuery.trim() ? 'Try a different search' : 'Create your first subscription to get started'}
                    </p>
                    {!searchQuery.trim() && (
                      <Button
                        variant="outline"
                        className="mt-5 h-10 px-4 rounded-lg border-slate-200 text-[#0f172a] hover:bg-slate-100"
                        onClick={() => setIsNewDialogOpen(true)}
                      >
                        Create First Subscription
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9 border-slate-200 rounded-md"
                        />
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead className="min-w-[100px]">Password</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right w-[1%] whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSubscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium text-[#0f172a]">
                              <Link
                                to={`/dashboard/subscriptions/${sub.id}`}
                                className="text-[#0f172a] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 rounded cursor-pointer"
                                title="View complete details, modules enrolled & billing enrolled"
                              >
                                {sub.fullName}
                              </Link>
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate" title={sub.email}>{sub.email}</TableCell>
                            <TableCell>{sub.mobile}</TableCell>
                            <TableCell className="font-mono text-sm whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span title={visiblePasswordId === sub.id ? 'Hide password' : 'Show password'}>
                                  {visiblePasswordId === sub.id ? (sub.password ?? '—') : (sub.password ? '••••••' : '—')}
                                </span>
                                {sub.password && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => setVisiblePasswordId((prev) => (prev === sub.id ? null : sub.id))}
                                    aria-label={visiblePasswordId === sub.id ? 'Hide password' : 'Show password'}
                                  >
                                    {visiblePasswordId === sub.id ? (
                                      <EyeOff className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-slate-500" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 rounded-md border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-medium"
                                  onClick={() => handleAssignPlans(sub.id)}
                                >
                                  {sub.hasPlanAssignment ? (
                                    <>
                                      <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                      Upgrade
                                    </>
                                  ) : (
                                    <>
                                      <Link2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                      Assign
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 rounded-md border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-medium"
                                  onClick={() => handleConfigureEmail(sub.id)}
                                >
                                  <Mail className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                  Configure Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 w-8 p-0 rounded-md"
                                  onClick={() => handleDeleteSubscription(sub.id, sub.fullName)}
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
                      totalItems={filteredSubscriptions.length}
                      pageSize={PAGE_SIZE}
                    />
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <NewSubscriptionDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onSubmit={handleCreateSubscription}
      />

      {selectedSubscription && (
        <AssignPlansDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          subscriptionId={selectedSubscription}
        />
      )}

      <ConfigureEmailDialog
        open={!!selectedSubscriptionForEmail}
        onOpenChange={(open) => { if (!open) setSelectedSubscriptionForEmail(null); }}
        subscriptionId={selectedSubscriptionForEmail}
      />
    </div>
  );
}
