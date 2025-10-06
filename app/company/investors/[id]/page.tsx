"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Mail,
  Calendar,
  CircleDollarSign,
  TrendingUp,
  User,
  Wallet,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { investors as investorsAPI } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DetailViewSkeleton } from "@/components/skeletons";

export default function InvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvestor() {
      try {
        const data = await investorsAPI.get(id);
        setInvestor(data);
      } catch (error) {
        console.error('Failed to load investor:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInvestor();
  }, [id]);

  if (loading) return <DetailViewSkeleton />;

  if (!investor) {
    return (
      <div className="p-4 md:p-6 lg:p-8 text-center text-muted-foreground">
        Investor not found.
      </div>
    );
  }

  // Get all contributions by this investor
  const investorContributions = investor.contributions || [];

  // Calculate total contributed
  const totalContributed = investorContributions.reduce(
    (sum: number, c: any) => sum + c.amount,
    0
  );

  // Group contributions by round
  const roundMap = new Map();
  investorContributions.forEach((contrib: any) => {
    const roundId = contrib.round?.id;
    if (!roundId) return;
    
    if (roundMap.has(roundId)) {
      const existing = roundMap.get(roundId);
      existing.total += contrib.amount;
      existing.contributions.push(contrib);
    } else {
      roundMap.set(roundId, {
        round: contrib.round,
        total: contrib.amount,
        contributions: [contrib],
      });
    }
  });

  const contributionsByRound = Array.from(roundMap.values()).map((item) => {
    const round = item.round;
    const progress = round.target > 0 ? (item.total / round.maxContribution) * 100 : 0;
    return {
      round: item.round,
      contributions: item.contributions,
      total: item.total,
      progress,
    };
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/company/investors">
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Investors
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{investor.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Joined {formatDate(investor.joinedDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`mailto:${investor.email}`}>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
            </a>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => router.push(`/company/investors/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Investor Info */}
      <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Investor Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <div className="font-medium">{investor.name}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <div className="font-medium">{investor.email}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </div>
                <div className="font-medium text-sm">
                  {investor.walletAddress || "Not provided"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </div>
                <div className="font-medium">{formatDate(investor.joinedDate)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Account Status
                </div>
                <div>
                  <StatusBadge status={investor.status} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalContributed)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contributionsByRound.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {investorContributions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {investorContributions.length > 0
                ? formatCurrency(
                    totalContributed / investorContributions.length
                  )
                : "$0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment by Round */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle>Investments by Round</CardTitle>
          <CardDescription>Breakdown of contributions across all rounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {contributionsByRound.map(({ round, contributions, total }) => {
            const progress = (round.raised / round.target) * 100;
            return (
              <div key={round.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{round.name}</h3>
                      <StatusBadge status={round.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contributions.length} contribution{contributions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((total / round.maxContribution) * 100).toFixed(1)}% of max
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Round progress: {progress.toFixed(1)}%</span>
                  <Link href={`/company/rounds/${round.id}`}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      View Round
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}

          {contributionsByRound.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No contributions yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>All contributions made by this investor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investorContributions.map((contribution) => {
                  return (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">
                        {contribution.round?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(contribution.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contribution.token}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(contribution.contributedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={contribution.status} />
                      </TableCell>
                      <TableCell>
                        {contribution.transactionHash ? (
                          <code className="text-xs text-muted-foreground">
                            {contribution.transactionHash.slice(0, 10)}...
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {investorContributions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No contribution history available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

