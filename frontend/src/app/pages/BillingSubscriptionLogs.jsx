import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useGetAllBillingSubscriptionLogsQuery } from '../store/services/lmsApi';
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

export function BillingSubscriptionLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: logs = [], isLoading, error } = useGetAllBillingSubscriptionLogsQuery();

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Failed to load subscriptions logs'));
  }, [error]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        (log.planName || '').toLowerCase().includes(q) ||
        (log.subscriptionName || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q)
    );
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

  const formatDuration = (duration) => {
    if (!duration) return '—';
    return duration.replace(/-/g, ' ');
  };

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Plan Subscription Logs</h2>
        <p className="text-slate-500 mt-1 text-sm">Track plan lifecycle: created, updated, and deleted</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0f172a] flex items-center gap-2">
            <History className="w-5 h-5" />
            Plan Subscription Logs
          </CardTitle>
          <CardDescription className="text-sm">
            A new log entry is created when a plan is created, updated, or deleted
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <History className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 font-medium">
                {searchQuery.trim() ? 'No matching logs' : 'No subscriptions logs yet'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery.trim() ? 'Try a different search' : 'Create, update, or delete plans from the Plans page to see logs here'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by plan or user name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 border-slate-200 rounded-md"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User (Who)</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Details</TableHead>
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
                      <TableCell className="font-medium text-[#0f172a]">
                        {log.planName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.action === 'Plan updated'
                              ? 'bg-blue-500/10 text-blue-700 border-blue-200'
                              : log.action === 'Plan created'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                                : log.action === 'Plan deleted'
                                  ? 'bg-red-500/10 text-red-700 border-red-200'
                                  : 'bg-slate-500/10 text-slate-700 border-slate-200'
                          }
                        >
                          {log.action ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDuration(log.duration)}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatDate(log.startDate)}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatDate(log.endDate)}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate" title={log.details ?? ''}>
                        {log.details ?? '—'}
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
