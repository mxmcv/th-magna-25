"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, MoreVertical, Mail, CheckCircle, Clock, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvestorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [investorToRemove, setInvestorToRemove] = useState<{
    id: string;
    name: string;
    email: string;
    totalContributed: number;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemoveInvestor = () => {
    setIsRemoving(true);
    console.log("Removing investor:", investorToRemove?.id);
    // Will implement API call later
    setTimeout(() => {
      setIsRemoving(false);
      setRemoveDialogOpen(false);
      setInvestorToRemove(null);
    }, 1000);
  };

  // Mock data
  const investors = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      totalContributed: 150000,
      rounds: ["Seed Round", "Series A"],
      status: "active",
      joinedDate: "2025-09-15",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      totalContributed: 75000,
      rounds: ["Series A"],
      status: "active",
      joinedDate: "2025-10-01",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com",
      totalContributed: 200000,
      rounds: ["Pre-Seed", "Seed Round"],
      status: "active",
      joinedDate: "2025-06-20",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      totalContributed: 0,
      rounds: [],
      status: "invited",
      joinedDate: "2025-10-05",
    },
    {
      id: "5",
      name: "Alex Wong",
      email: "alex@example.com",
      totalContributed: 50000,
      rounds: ["Seed Round"],
      status: "active",
      joinedDate: "2025-09-25",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary/10 text-primary gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Invited
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get unique rounds for filter
  const allRounds = Array.from(
    new Set(investors.flatMap((inv) => inv.rounds))
  );

  const filteredInvestors = investors.filter((investor) => {
    // Search filter
    const matchesSearch =
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || investor.status === statusFilter;

    // Round filter
    const matchesRound =
      roundFilter === "all" ||
      investor.rounds.includes(roundFilter);

    return matchesSearch && matchesStatus && matchesRound;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Investors</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage and track your investor relationships</p>
        </div>
        <Link href="/company/investors/invite">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Invite Investors
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{investors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {investors.filter((i) => i.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(investors.reduce((sum, i) => sum + i.totalContributed, 0) / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {(
                investors.reduce((sum, i) => sum + i.totalContributed, 0) /
                investors.filter((i) => i.totalContributed > 0).length /
                1000
              ).toFixed(0)}
              K
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investors Table */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Investor List</CardTitle>
                <CardDescription className="text-sm">View and manage all your investors</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={roundFilter} onValueChange={setRoundFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  {allRounds.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(statusFilter !== "all" || roundFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setRoundFilter("all");
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rounds</TableHead>
                <TableHead className="text-right">Total Contributed</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvestors.map((investor) => (
                <TableRow key={investor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{investor.name}</div>
                      <div className="text-sm text-muted-foreground">{investor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(investor.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {investor.rounds.length > 0 ? (
                        investor.rounds.map((round) => (
                          <Badge key={round} variant="outline" className="text-xs">
                            {round}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No rounds</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {investor.totalContributed > 0
                      ? `$${investor.totalContributed.toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(investor.joinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/company/investors/${investor.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/company/investors/${investor.id}/edit`)}>
                          Edit Information
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/company/investors/invite")}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setInvestorToRemove(investor);
                            setRemoveDialogOpen(true);
                          }}
                        >
                          Remove Investor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remove Investor Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this investor?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will permanently remove <span className="font-semibold">{investorToRemove?.name}</span> from your investor list.
                </p>
                <p className="text-sm">
                  Email: <span className="font-semibold">{investorToRemove?.email}</span>
                </p>
                {investorToRemove && investorToRemove.totalContributed > 0 && (
                  <p className="text-sm">
                    Total contributed: <span className="font-semibold">${investorToRemove.totalContributed.toLocaleString()}</span>
                  </p>
                )}
                <p className="text-destructive text-sm font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveInvestor}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Yes, Remove Investor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
