"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Filter,
  Download,
  Search,
  Shield,
  User,
  Building2,
  DollarSign,
  Mail,
  Key,
  Trash2,
  Edit,
  CheckCircle,
  UserPlus,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/lib/date-utils";
import { GridViewSkeleton } from "@/components/skeletons";

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userType: 'company' | 'investor';
  changes: any;
  metadata: any;
  timestamp: string;
}

const actionIcons: Record<string, any> = {
  CREATE: UserPlus,
  UPDATE: Edit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  REGISTER: Key,
  CONTRIBUTE: DollarSign,
  CONFIRM_CONTRIBUTION: CheckCircle,
  CLOSE_ROUND: Shield,
  INVITE: Mail,
  TOKEN_ALLOCATION: FileText,
};

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-500/10 text-green-500 border-green-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  LOGIN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  LOGOUT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  REGISTER: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  CONTRIBUTE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  CONFIRM_CONTRIBUTION: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  CLOSE_ROUND: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  INVITE: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  TOKEN_ALLOCATION: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

// Helper function to get a readable summary for each log entry
function getLogSummary(log: AuditLog): string {
  // Check metadata first
  if (log.metadata) {
    if (log.metadata.roundName) return log.metadata.roundName;
    if (log.metadata.email) return log.metadata.email;
    if (log.metadata.ip) return `IP: ${log.metadata.ip}`;
    if (log.metadata.tokenPrice) return `Token price: $${log.metadata.tokenPrice}`;
    if (log.metadata.investorCount) return `${log.metadata.investorCount} investor(s)`;
  }

  // Check changes for useful info
  if (log.changes) {
    if (log.changes.created) {
      const created = log.changes.created;
      if (created.name) return created.name;
      if (created.email) return created.email;
      if (created.amount) return `$${(created.amount / 1000).toFixed(1)}K`;
    }
    
    // For updates, show what changed
    const changeKeys = Object.keys(log.changes).filter(k => k !== 'created' && k !== 'deleted');
    if (changeKeys.length > 0) {
      return `${changeKeys.length} field(s) updated`;
    }
  }

  return '';
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState<string>('all');
  const [action, setAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    loadLogs();
  }, [entityType, action, page]);

  async function loadLogs() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityType && entityType !== 'all') params.append('entityType', entityType);
      if (action && action !== 'all') params.append('action', action);
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());

      const response = await fetch(`/api/audit?${params.toString()}`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Entity Type', 'Action', 'User Type', 'User ID', 'Summary'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.entityType,
      log.action,
      log.userType,
      log.userId,
      getLogSummary(log),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || FileText;
    return <Icon className="w-3.5 h-3.5" />;
  };

  const filteredLogs = searchTerm
    ? logs.filter(log =>
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLogSummary(log).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  const totalPages = Math.ceil(total / limit);
  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  if (loading) return <GridViewSkeleton />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Complete audit trail of all system activities
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Round">Round</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                  <SelectItem value="Contribution">Contribution</SelectItem>
                  <SelectItem value="Invitation">Invitation</SelectItem>
                  <SelectItem value="Auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CONTRIBUTE">Contribute</SelectItem>
                  <SelectItem value="INVITE">Invite</SelectItem>
                  <SelectItem value="CLOSE_ROUND">Close Round</SelectItem>
                  <SelectItem value="TOKEN_ALLOCATION">Token Allocation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Showing {startEntry}-{endEntry} of {total} total entries
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search or filters' : 'Activity will appear here as actions are performed'}
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {formatRelativeTime(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.entityType === 'Round' && <Building2 className="w-4 h-4 text-muted-foreground" />}
                              {log.entityType === 'Investor' && <User className="w-4 h-4 text-muted-foreground" />}
                              {log.entityType === 'Contribution' && <DollarSign className="w-4 h-4 text-muted-foreground" />}
                              {log.entityType === 'Invitation' && <Mail className="w-4 h-4 text-muted-foreground" />}
                              {log.entityType === 'Auth' && <Key className="w-4 h-4 text-muted-foreground" />}
                              <span className="text-sm">{log.entityType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`gap-1 ${actionColors[log.action] || 'bg-muted'}`}
                            >
                              {getActionIcon(log.action)}
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium capitalize">{log.userType}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {log.userId.substring(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getLogSummary(log) || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium px-2">
                    {page}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
