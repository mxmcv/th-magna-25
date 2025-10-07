"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, Info, CheckCircle, AlertCircle } from "lucide-react";
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
import { GridViewSkeleton } from "@/components/skeletons";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function AvailableRoundsPage() {
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadRounds();
  }, []);

  async function loadRounds() {
    try {
      const [roundsData, contributionsData] = await Promise.all([
        roundsAPI.list(),
        contributionsAPI.list(),
      ]);
      
      // Calculate myContribution for each round
      const contributionsByRound = new Map();
      contributionsData.forEach((c: any) => {
        const existing = contributionsByRound.get(c.roundId) || 0;
        contributionsByRound.set(c.roundId, existing + c.amount);
      });
      
      // Add myContribution to each round
      const roundsWithContributions = roundsData.map((round: any) => ({
        ...round,
        myContribution: contributionsByRound.get(round.id) || 0,
      }));
      
      setRounds(roundsWithContributions);
    } catch (error) {
      // Silently fail - user will see empty state
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <GridViewSkeleton />;

  const handleContribute = async () => {
    if (!selectedRound || !contributionAmount) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await contributionsAPI.create({
        roundId: selectedRound,
        amount: parseFloat(contributionAmount),
        token: selectedToken,
      });
      
      setSuccessMessage('Contribution successful!');
      setContributionAmount("");
      setSelectedRound(null);
      
      // Close dialog
      dialogCloseRef.current?.click();
      
      // Reload rounds to show updated data
      await loadRounds();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      // Error is a string message from Promise.reject
      setErrorMessage(typeof error === 'string' ? error : 'Failed to create contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRounds = rounds;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Available Rounds</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Explore active fundraising rounds and make contributions
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-500 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        </div>
      )}

      {displayRounds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No active fundraising rounds available at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later for new investment opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {displayRounds.map((round: any) => {
          const progress = round.target > 0 ? (round.raised / round.target) * 100 : 0;
          const hasInvested = round.myContribution > 0;
          const canContributeMore = round.myContribution < round.maxContribution;
          const remainingAllocation = round.maxContribution - (round.myContribution || 0);

          return (
            <Card key={round.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{round.name}</CardTitle>
                      <StatusBadge status={round.status} />
                      {hasInvested && (
                        <Badge variant="outline" className="text-xs">
                          Already Invested: ${(round.myContribution / 1000).toFixed(0)}K
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">{round.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fundraising Progress</span>
                    <span className="font-semibold text-lg">
                      ${(round.raised / 1000000).toFixed(2)}M / $
                      {(round.target / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% funded</span>
                    <span>{round.participants} participants</span>
                  </div>
                </div>

                {/* Round Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Target className="w-4 h-4" />
                      Min Investment
                    </div>
                    <div className="text-lg font-bold">
                      ${(round.minContribution / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Max Investment
                    </div>
                    <div className="text-lg font-bold">
                      ${(round.maxContribution / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </div>
                    <div className="text-sm font-semibold">
                      {round.endDate 
                        ? new Date(round.endDate).toLocaleDateString()
                        : 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">Accepted</div>
                    <div className="flex gap-1">
                      {round.acceptedTokens.map((token) => (
                        <Badge key={token} variant="outline" className="text-xs">
                          {token}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contribution Info */}
                {hasInvested && canContributeMore && (
                  <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        You can contribute up to{" "}
                      </span>
                      <span className="font-semibold">
                        ${(remainingAllocation / 1000).toFixed(0)}K more
                      </span>
                      <span className="text-muted-foreground"> to this round.</span>
                    </div>
                  </div>
                )}

                {/* Max Investment Notice */}
                {hasInvested && !canContributeMore && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="text-sm text-center">
                      <span className="font-medium text-primary/70">
                        Maximum investment reached
                      </span>
                      <span className="text-muted-foreground text-xs block mt-0.5">
                        You've contributed ${(round.myContribution / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {(!hasInvested || canContributeMore) && (
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
                          onClick={() => setSelectedRound(round.id)}
                        >
                          {hasInvested ? "Add to Investment" : "Contribute to Round"}
                        </Button>
                      </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contribute to {round.name}</DialogTitle>
                      <DialogDescription>
                        Enter your contribution amount and select your preferred stablecoin
                      </DialogDescription>
                    </DialogHeader>
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
                          {hasInvested ? (
                            <>
                              You can add up to $
                              {(remainingAllocation / 1000).toFixed(1)}
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
                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2 mt-4">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                        <p className="text-sm text-destructive">{errorMessage}</p>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button ref={dialogCloseRef} variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={() => handleContribute().catch(() => {})} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Confirm Contribution'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
