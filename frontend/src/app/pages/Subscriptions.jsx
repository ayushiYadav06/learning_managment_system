import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, LucideTrash2 as Trash2, Settings, Users } from 'lucide-react';
import {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} from '../store/services/lmsApi';
import { NewSubscriptionDialog } from '../components/NewSubscriptionDialog';
import { AssignModulesDialog } from '../components/AssignModulesDialog';
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

const SUBSCRIPTION_TYPES = ['Individual', 'Hybrid', 'Institute/School'];

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

export function Subscriptions() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('Individual');

  const { data: subscriptions = [], isLoading, error } = useGetSubscriptionsQuery();
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();

  const filteredSubscriptions = useMemo(
    () => subscriptions.filter((sub) => sub.type === activeTab),
    [subscriptions, activeTab]
  );

  const handleCreateSubscription = async (data) => {
    try {
      const created = await createSubscription(data).unwrap();
      setIsNewDialogOpen(false);
      toast.success(`Subscription created for ${data.fullName}.`);
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

  const handleAssignModules = (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
    setIsAssignDialogOpen(true);
  };

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load subscriptions'));
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Subscriptions</h2>
          <p className="text-gray-500 mt-1">Manage all subscription accounts</p>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          New Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>View and manage subscriptions by type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Individual">Individual</TabsTrigger>
              <TabsTrigger value="Hybrid">Hybrid</TabsTrigger>
              <TabsTrigger value="Institute/School">Institute/School</TabsTrigger>
            </TabsList>

            {SUBSCRIPTION_TYPES.map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                {isLoading ? (
                  <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No {type} subscriptions found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsNewDialogOpen(true)}
                    >
                      Create First Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.fullName}</TableCell>
                            <TableCell>{sub.email}</TableCell>
                            <TableCell>{sub.mobile}</TableCell>
                            <TableCell>{sub.username}</TableCell>
                            <TableCell>
                              <Badge className={getTypeBadgeColor(sub.type)}>{sub.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAssignModules(sub.id)}
                                >
                                  <Settings className="w-4 h-4 mr-1" />
                                  Assign Modules
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteSubscription(sub.id, sub.fullName)}
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
        <AssignModulesDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          subscriptionId={selectedSubscription}
        />
      )}
    </div>
  );
}
