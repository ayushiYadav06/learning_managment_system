import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Pencil, LucideTrash2 as Trash2, Package } from 'lucide-react';
import {
  useGetModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} from '../store/services/lmsApi';
import { ModuleDialog } from '../components/ModuleDialog';
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

export function Modules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const { data: modules = [], isLoading, error } = useGetModulesQuery();
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();
  const [deleteModule, { isLoading: isDeleting }] = useDeleteModuleMutation();

  const handleCreateModule = async (data) => {
    try {
      await createModule(data).unwrap();
      setIsDialogOpen(false);
      toast.success('Module created successfully');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to create module'));
    }
  };

  const handleUpdateModule = async (data) => {
    if (!editingModule) return;
    try {
      await updateModule({ id: editingModule.id, data }).unwrap();
      setEditingModule(null);
      setIsDialogOpen(false);
      toast.success('Module updated successfully');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update module'));
    }
  };

  const handleDeleteModule = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the ${name} module?`)) return;
    try {
      await deleteModule(id).unwrap();
      toast.success('Module deleted');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete module'));
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingModule(null);
  };

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load modules'));
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Modules</h2>
          <p className="text-gray-500 mt-1">Manage system modules and features</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isCreating || isUpdating}>
          <Plus className="w-4 h-4 mr-2" />
          New Module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Master</CardTitle>
          <CardDescription>All available modules in the LMS system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No modules found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Create First Module
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell>
                        {new Date(module.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(module)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteModule(module.id, module.name)}
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

      <ModuleDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={editingModule ? handleUpdateModule : handleCreateModule}
        initialData={editingModule ?? undefined}
      />
    </div>
  );
}
