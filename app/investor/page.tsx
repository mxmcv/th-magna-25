"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, ArrowUpRight } from "lucide-react";
import Link from "next/link";
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

export default function InvestorDashboard() {
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  // Mock data - represents this investor's portfolio
  const stats = [
    {
      title: "Total Invested",
      value: "$150K",
      change: "Across 2 rounds",
      icon: DollarSign,
    },
    {
      title: "Active Rounds",
      value: "2",
      change: "In progress",
      icon: TrendingUp,
    },
    {
      title: "Completed Rounds",
      value: "1",
      change: "Pre-Seed",
      icon: Target,
    },
  ];

  const myInvestments = [
    {
      id: "1",
      roundName: "Seed Round",
      companyName: "Demo Company",
      myContribution: 100000,
      token: "USDC",
      totalRaised: 3200000,
      target: 5000000,
      status: "active",
      contributedDate: "2025-09-20",
    },
    {
      id: "2",
      roundName: "Series A",
      companyName: "Demo Company",
      myContribution: 50000,
      token: "USDT",
      totalRaised: 1000000,
      target: 10000000,
      status: "active",
      contributedDate: "2025-10-03",
    },
  ];

  const availableRounds = [
    {
      id: "1",
      name: "Seed Round",
      company: "Demo Company",
      target: 5000000,
      raised: 3200000,
      minContribution: 10000,
      maxContribution: 100000,
      acceptedTokens: ["USDC", "USDT"],
      endDate: "2025-11-30",
    },
    {
      id: "2",
      name: "Series A",
      company: "Demo Company",
      target: 10000000,
      raised: 1000000,
      minContribution: 50000,
      maxContribution: 500000,
      acceptedTokens: ["USDC", "USDT"],
      endDate: "2025-12-31",
    },
  ];

  const handleContribute = () => {
    console.log("Contributing:", { selectedRoundId, contributionAmount, selectedToken });
    // Will implement API call later
    setContributionAmount("");
    setSelectedRoundId(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track your investments and discover new opportunities</p>
      </div>

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
          {myInvestments.map((investment) => {
            const progress = (investment.totalRaised / investment.target) * 100;
            return (
              <div key={investment.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{investment.roundName}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contributed {new Date(investment.contributedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${(investment.myContribution / 1000).toFixed(0)}K
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
                      ${(investment.totalRaised / 1000000).toFixed(1)}M of $
                      {(investment.target / 1000000).toFixed(1)}M raised
                    </span>
                    <span>{progress.toFixed(1)}% funded</span>
                  </div>
                </div>
              </div>
            );
          })}
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
                        ${round.minContribution / 1000}K - ${round.maxContribution / 1000}K
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ends</span>
                      <span className="font-medium">
                        {new Date(round.endDate).toLocaleDateString()}
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
                              {myInvestment
                                ? ((round.maxContribution - myInvestment.myContribution) / 1000).toFixed(0)
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
