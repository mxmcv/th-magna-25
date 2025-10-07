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
  X,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect } from "react";
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
import { rounds as roundsAPI } from "@/lib/api-client";
import { DetailViewSkeleton } from "@/components/skeletons";
import { useRouter } from "next/navigation";
export default function RoundDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [round, setRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    loadRound();
  }, [id]);
  async function loadRound() {
    try {
      const data = await roundsAPI.get(id);
      setRound(data);
      } catch (error) {
        // Silently fail - user will see skeleton
      } finally {
      setLoading(false);
    }
  }
  if (loading) return <DetailViewSkeleton />;
  if (!round) {
    return (
      <div className="p-8 text-center">
        <p>Round not found</p>
        <Link href="/company/rounds">
          <Button className="mt-4">Back to Rounds</Button>
        </Link>
      </div>
    );
  }
  const contributions = round.contributions || [];
  const progress = round.target > 0 ? (round.raised / round.target) * 100 : 0;
  const daysRemaining = Math.ceil(
    (new Date(round.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeDisplay = daysRemaining > 0 ? `${daysRemaining}` : round.status === "COMPLETED" || round.status === "CLOSED" ? "Ended" : "Expired";
  const timeLabel = daysRemaining > 0 ? "Days remaining" : "";
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
  const handleCloseRound = async () => {
    setIsClosing(true);
    setErrorMessage("");
    try {
      await roundsAPI.close(id);
      router.push('/company/rounds');
    } catch (error) {
      setErrorMessage(typeof error === 'string' ? error : 'Failed to close round. Please try again.');
      setIsClosing(false);
    }
  };
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
                    <Link href={`/company/rounds/${id}/token-allocation`} className="flex items-center cursor-pointer">
                      <Coins className="w-4 h-4 mr-2" />
                      Token Allocation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
            <div className="text-2xl md:text-3xl font-bold">{timeDisplay}</div>
            {timeLabel && <p className="text-xs text-muted-foreground mt-1">{timeLabel}</p>}
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
                ${(round.maxContribution / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </div>
              <div className="text-lg font-semibold">
                {round.startDate 
                  ? new Date(round.startDate).toLocaleDateString()
                  : 'Not set'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </div>
              <div className="text-lg font-semibold">
                {round.endDate 
                  ? new Date(round.endDate).toLocaleDateString()
                  : 'Not set'}
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
          {contributions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No investors have contributed to this round yet.
              </p>
            </div>
          ) : (
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
                  {contributions.map((contribution: any) => (
                    <TableRow key={contribution.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contribution.investor?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{contribution.investor?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${contribution.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contribution.token}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contribution.contributedAt
                          ? new Date(contribution.contributedAt).toLocaleDateString()
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
