"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, Info } from "lucide-react";
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
import { useState } from "react";

export default function AvailableRoundsPage() {
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const rounds = [
    {
      id: "1",
      name: "Seed Round",
      company: "Demo Company",
      description:
        "Early-stage funding to develop our DeFi platform and expand the team. Join us in building the future of decentralized finance.",
      target: 5000000,
      raised: 3200000,
      minContribution: 10000,
      maxContribution: 100000,
      participants: 28,
      acceptedTokens: ["USDC", "USDT"],
      status: "active",
      startDate: "2025-09-01",
      endDate: "2025-11-30",
      myContribution: 100000,
    },
    {
      id: "2",
      name: "Series A",
      company: "Demo Company",
      description:
        "Growth capital to scale operations, expand globally, and launch new product features. Strategic round for long-term partners.",
      target: 10000000,
      raised: 1000000,
      minContribution: 50000,
      maxContribution: 500000,
      participants: 5,
      acceptedTokens: ["USDC", "USDT"],
      status: "active",
      startDate: "2025-10-01",
      endDate: "2025-12-31",
      myContribution: 50000,
    },
  ];

  const handleContribute = () => {
    console.log("Contributing:", { selectedRound, contributionAmount, selectedToken });
    // Will implement API call later
    setContributionAmount("");
    setSelectedRound(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Available Rounds</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Explore active fundraising rounds and make contributions
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {rounds.map((round) => {
          const progress = (round.raised / round.target) * 100;
          const hasInvested = round.myContribution > 0;
          const canContributeMore = round.myContribution < round.maxContribution;
          const remainingAllocation = round.maxContribution - round.myContribution;

          return (
            <Card key={round.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{round.name}</CardTitle>
                      <Badge className="bg-primary/10 text-primary">Active</Badge>
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
                      ${(round.maxContribution / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </div>
                    <div className="text-sm font-semibold">
                      {new Date(round.endDate).toLocaleDateString()}
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
                          Min: ${(round.minContribution / 1000).toFixed(0)}K • Max: $
                          {hasInvested
                            ? (remainingAllocation / 1000).toFixed(0)
                            : (round.maxContribution / 1000).toFixed(0)}
                          K
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
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleContribute}>Confirm Contribution</Button>
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
    </div>
  );
}
