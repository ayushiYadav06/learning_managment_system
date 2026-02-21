import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Pencil, LucideTrash2 as Trash2, Package, Search } from 'lucide-react';
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
import { Pagination, PAGE_SIZE } from '../components/ui/pagination';

export function Modules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: modules = [], isLoading, error } = useGetModulesQuery();

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.module_code || '').toLowerCase().includes(q)
    );
  }, [modules, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / PAGE_SIZE));
  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredModules.slice(start, start + PAGE_SIZE);
  }, [filteredModules, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Modules</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage system modules and features</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={isCreating || isUpdating}
          className="bg-[#0f172a] hover:bg-[#1e293b] shadow-sm h-10 px-5 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a]">Modules</CardTitle>
          <CardDescription className="text-sm">All available modules in the LMS system</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">Loading...</div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-700 font-medium">
                {searchQuery.trim() ? 'No matching modules' : 'No modules found'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery.trim() ? 'Try a different search' : 'Create your first module to get started'}
              </p>
              {!searchQuery.trim() && (
                <Button
                  variant="outline"
                  className="mt-5 h-10 px-4 rounded-lg border-slate-200 text-[#0f172a] hover:bg-slate-100"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create First Module
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
                    <TableHead>Module Name</TableHead>
                    <TableHead>Module Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right w-[1%] whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium text-[#0f172a]">{module.name}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-600">{module.module_code || '—'}</TableCell>
                    <TableCell className="max-w-[280px]">{module.description}</TableCell>
                    <TableCell className="text-slate-600">{new Date(module.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 rounded-md border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-medium"
                          onClick={() => handleEdit(module)}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 rounded-md"
                          onClick={() => handleDeleteModule(module.id, module.name)}
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
              totalItems={filteredModules.length}
              pageSize={PAGE_SIZE}
            />
          </>
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
