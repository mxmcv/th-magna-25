"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, ArrowUpRight, CheckCircle, AlertCircle, CircleDollarSign } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { rounds as roundsAPI, contributions as contributionsAPI } from "@/lib/api-client";
import { DashboardSkeleton } from "@/components/skeletons";

export default function InvestorDashboard() {
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [myInvestments, setMyInvestments] = useState<any[]>([]);
  const [availableRounds, setAvailableRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInvested, setTotalInvested] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allRounds, myContributions] = await Promise.all([
        roundsAPI.list(),
        contributionsAPI.list(),
      ]);

      // API already filters to ACTIVE rounds for investors
      setAvailableRounds(allRounds);

      // Process contributions
      const investmentMap = new Map();
      let total = 0;
      myContributions.forEach((c: any) => {
        total += c.amount;
        const existing = investmentMap.get(c.roundId);
        if (existing) {
          existing.myContribution += c.amount;
        } else {
          investmentMap.set(c.roundId, {
            id: c.roundId, // Use roundId as unique identifier
            roundName: c.round?.name,
            myContribution: c.amount,
            token: c.token,
            totalRaised: c.round?.raised,
            target: c.round?.target,
            status: c.round?.status?.toLowerCase(),
            contributedDate: c.contributedAt,
          });
        }
      });

      setMyInvestments(Array.from(investmentMap.values()));
      setTotalInvested(total);
    } catch (error) {
      // Silently fail - user will see empty state
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  const stats = [
    {
      title: "Total Invested",
      value: totalInvested > 0 ? `$${(totalInvested / 1000).toFixed(0)}K` : "$0",
      change: myInvestments.length > 0 ? `Across ${myInvestments.length} rounds` : "No investments yet",
      icon: DollarSign,
    },
    {
      title: "Active Rounds",
      value: myInvestments.filter(i => i.status === 'active').length.toString(),
      change: "In progress",
      icon: TrendingUp,
    },
    {
      title: "Completed Rounds",
      value: myInvestments.filter(i => i.status === 'closed').length.toString(),
      change: "Finalized",
      icon: Target,
    },
  ];

  const handleContribute = async () => {
    if (!selectedRoundId || !contributionAmount) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await contributionsAPI.create({
        roundId: selectedRoundId,
        amount: parseFloat(contributionAmount),
        token: selectedToken,
      });
      
      setSuccessMessage('Contribution successful!');
      setContributionAmount("");
      setSelectedRoundId(null);
      
      // Close dialog
      dialogCloseRef.current?.click();
      
      // Reload data
      await loadData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      // Error is a string message from Promise.reject
      setErrorMessage(typeof error === 'string' ? error : 'Failed to create contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track your investments and discover new opportunities</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <p>{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Active Investments */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Active Investments</CardTitle>
              <CardDescription>Current rounds you're participating in</CardDescription>
            </div>
            <Link href="/investor/history">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {myInvestments.length === 0 ? (
            <div className="text-center py-12">
              <CircleDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Investments</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't made any contributions yet
              </p>
              <Link href="/investor/rounds">
                <Button>
                  Browse Available Rounds
                </Button>
              </Link>
            </div>
          ) : (
            myInvestments.map((investment) => {
              const progress = investment.target > 0 ? (investment.totalRaised / investment.target) * 100 : 0;
              return (
                <div key={investment.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{investment.roundName || 'Unknown Round'}</h3>
                        <StatusBadge status={investment.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contributed {investment.contributedDate 
                          ? new Date(investment.contributedDate).toLocaleDateString()
                          : 'Unknown date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {investment.myContribution > 0 ? `$${(investment.myContribution / 1000).toFixed(0)}K` : '$0'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Your contribution • {investment.token}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        ${((investment.totalRaised || 0) / 1000000).toFixed(1)}M of $
                        {((investment.target || 0) / 1000000).toFixed(1)}M raised
                      </span>
                      <span>{progress.toFixed(1)}% funded</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Available Rounds */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Rounds</CardTitle>
              <CardDescription>Discover new investment opportunities</CardDescription>
            </div>
            <Link href="/investor/rounds">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {availableRounds.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Available Rounds</h3>
              <p className="text-sm text-muted-foreground">
                There are currently no active fundraising rounds you've been invited to
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {availableRounds.map((round) => {
              const progress = (round.raised / round.target) * 100;
              const myInvestment = myInvestments.find(
                (inv) => inv.roundName === round.name
              );

              return (
                <Card key={round.id} className="border-muted">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{round.name}</CardTitle>
                        <CardDescription>{round.company}</CardDescription>
                      </div>
                      {myInvestment && (
                        <Badge variant="outline" className="text-xs">
                          Invested
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          ${(round.raised / 1000000).toFixed(1)}M / $
                          {(round.target / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min - Max</span>
                      <span className="font-medium">
                        ${(round.minContribution / 1000).toFixed(1)}K - ${(round.maxContribution / 1000).toFixed(1)}K
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ends</span>
                      <span className="font-medium">
                        {round.endDate 
                          ? new Date(round.endDate).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          variant={myInvestment ? "outline" : "default"}
                          onClick={() => setSelectedRoundId(round.id)}
                        >
                          {myInvestment ? "Add More" : "Contribute"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contribute to {round.name}</DialogTitle>
                          <DialogDescription>
                            Enter your contribution amount and select your preferred stablecoin
                          </DialogDescription>
                        </DialogHeader>
                        {errorMessage && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-800 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="flex-1">{errorMessage}</p>
                            <button
                              onClick={() => setErrorMessage("")}
                              className="text-red-600 hover:text-red-800 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Contribution Amount (USD)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder={`Min: $${round.minContribution.toLocaleString()}`}
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              {myInvestment ? (
                                <>
                                  You can add up to $
                                  {((round.maxContribution - myInvestment.myContribution) / 1000).toFixed(1)}
                                  K more
                                </>
                              ) : (
                                <>
                                  Min: ${(round.minContribution / 1000).toFixed(1)}K • Max: $
                                  {(round.maxContribution / 1000).toFixed(1)}K
                                </>
                              )}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="token">Stablecoin</Label>
                            <Select value={selectedToken} onValueChange={setSelectedToken}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {round.acceptedTokens.map((token) => (
                                  <SelectItem key={token} value={token}>
                                    {token}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" ref={dialogCloseRef}>Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={() => handleContribute().catch(() => {})}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Processing..." : "Confirm Contribution"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
