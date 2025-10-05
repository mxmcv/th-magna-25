"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Edit,
  UserPlus,
  XCircle,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoundDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isClosing, setIsClosing] = useState(false);

  // Mock data - replace with API call
  const round = {
    id,
    name: "Seed Round",
    description:
      "Early-stage funding to develop our DeFi platform and expand the team. This round is crucial for establishing our market presence and building out core features.",
    target: 5000000,
    raised: 3200000,
    minContribution: 10000,
    maxContribution: 100000,
    status: "ACTIVE",
    acceptedTokens: ["USDC", "USDT"],
    startDate: "2025-09-01",
    endDate: "2025-11-30",
    participants: 28,
    createdAt: "2025-08-15",
  };

  const contributions = [
    {
      id: "1",
      investor: "John Smith",
      email: "john@example.com",
      amount: 75000,
      token: "USDC",
      date: "2025-09-15",
      status: "CONFIRMED",
    },
    {
      id: "2",
      investor: "Sarah Johnson",
      email: "sarah@example.com",
      amount: 100000,
      token: "USDT",
      date: "2025-09-18",
      status: "CONFIRMED",
    },
    {
      id: "3",
      investor: "Mike Chen",
      email: "mike@example.com",
      amount: 50000,
      token: "USDC",
      date: "2025-09-20",
      status: "CONFIRMED",
    },
    {
      id: "4",
      investor: "Emily Davis",
      email: "emily@example.com",
      amount: 25000,
      token: "USDC",
      date: "2025-09-22",
      status: "PENDING",
    },
    {
      id: "5",
      investor: "Alex Wong",
      email: "alex@example.com",
      amount: 60000,
      token: "USDT",
      date: "2025-09-25",
      status: "CONFIRMED",
    },
  ];

  const progress = (round.raised / round.target) * 100;
  const daysRemaining = Math.ceil(
    (new Date(round.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-500/10 text-green-500 gap-1">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCloseRound = () => {
    setIsClosing(true);
    // Will implement API call later
    console.log("Closing round:", id);
    setTimeout(() => {
      setIsClosing(false);
      // In production, redirect after successful close
      // router.push('/company/rounds');
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/company/rounds">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Rounds
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{round.name}</h1>
              <Badge className="bg-primary/10 text-primary">Active</Badge>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              {round.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href={`/company/rounds/${id}/investors`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full gap-2">
                <Users className="w-4 h-4" />
                View Investors
              </Button>
            </Link>
            <Link href="/company/investors/invite" className="flex-1 sm:flex-none">
              <Button className="w-full gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Investors
              </Button>
            </Link>
            
            {/* Actions Dropdown */}
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/company/rounds/${id}/edit`} className="flex items-center cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Round
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={round.status === "COMPLETED"}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Close Round
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close this round?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        This will permanently close <span className="font-semibold">{round.name}</span> and prevent any new contributions.
                      </p>
                      <p className="text-sm">
                        Current progress: <span className="font-semibold">${(round.raised / 1000000).toFixed(2)}M</span> of <span className="font-semibold">${(round.target / 1000000).toFixed(1)}M</span> ({((round.raised / round.target) * 100).toFixed(1)}% funded)
                      </p>
                      <p className="text-destructive text-sm font-medium">
                        This action cannot be undone.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCloseRound}
                    disabled={isClosing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClosing ? "Closing..." : "Yes, Close Round"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              ${(round.raised / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of ${(round.target / 1000000).toFixed(1)}M goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{progress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${((round.target - round.raised) / 1000000).toFixed(2)}M remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{round.participants}</div>
            <p className="text-xs text-muted-foreground mt-1">Active investors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Left
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground mt-1">Days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle>Fundraising Progress</CardTitle>
          <CardDescription>Track real-time progress toward your funding goal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={progress} className="h-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.toFixed(1)}% funded</span>
              <span>
                ${(round.raised / 1000000).toFixed(2)}M / ${(round.target / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Min Contribution
              </div>
              <div className="text-lg font-semibold">
                ${(round.minContribution / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Max Contribution
              </div>
              <div className="text-lg font-semibold">
                ${(round.maxContribution / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </div>
              <div className="text-lg font-semibold">
                {new Date(round.startDate).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </div>
              <div className="text-lg font-semibold">
                {new Date(round.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Accepted Tokens:</span>
            <div className="flex gap-2">
              {round.acceptedTokens.map((token) => (
                <Badge key={token} variant="outline">
                  {token}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
          <CardDescription>All contributions made to this round</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contribution.investor}</div>
                        <div className="text-sm text-muted-foreground">{contribution.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${contribution.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{contribution.token}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(contribution.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

