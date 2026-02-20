import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useGetAllSubscriptionLogsQuery } from '../store/services/lmsApi';
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
import { History, Search } from 'lucide-react';

export function SubscriptionLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: logs = [], isLoading, error } = useGetAllSubscriptionLogsQuery();

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load subscription logs'));
  }, [error]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => (log.subscriptionName || '').toLowerCase().includes(q));
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    try {
      return d.toLocaleString();
    } catch {
      return d.toISOString ? d.toISOString().slice(0, 16).replace('T', ' ') : String(d);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Subscription Log</h2>
        <p className="text-slate-500 mt-1 text-sm">Track all master assignment changes for subscriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a] flex items-center gap-2">
            <History className="w-5 h-5" />
            All Subscription Logs
          </CardTitle>
          <CardDescription className="text-sm">
            A new log entry is created each time masters are assigned to a subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <History className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 font-medium">
                {searchQuery.trim() ? 'No matching logs' : 'No subscription logs yet'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery.trim() ? 'Try a different search' : 'Assign masters to a subscription from the Subscriptions page to see logs here'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by subscription name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 border-slate-200 rounded-md"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Assigned Masters</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatDate(log.date)}
                      </TableCell>
                      <TableCell className="font-medium text-[#0f172a]">
                        {log.subscriptionName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#0f172a]/10 text-[#0f172a] border-[#0f172a]/20">
                          {log.action ?? 'Masters Assigned'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {Array.isArray(log.assignedModuleNames) && log.assignedModuleNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {log.assignedModuleNames.map((name, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border-slate-200"
                              >
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredLogs.length}
                pageSize={PAGE_SIZE}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
