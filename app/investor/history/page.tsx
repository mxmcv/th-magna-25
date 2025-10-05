import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function ContributionHistoryPage() {
  // Mock data
  const contributions = [
    {
      id: "1",
      roundName: "Seed Round",
      company: "Demo Company",
      amount: 100000,
      token: "USDC",
      date: "2025-09-20",
      status: "confirmed",
      transactionHash: "0x1234...5678",
      roundTarget: 5000000,
      roundRaised: 3200000,
    },
    {
      id: "2",
      roundName: "Series A",
      company: "Demo Company",
      amount: 50000,
      token: "USDT",
      date: "2025-10-03",
      status: "confirmed",
      transactionHash: "0xabcd...efgh",
      roundTarget: 10000000,
      roundRaised: 1000000,
    },
    {
      id: "3",
      roundName: "Pre-Seed",
      company: "Demo Company",
      amount: 25000,
      token: "USDC",
      date: "2025-06-25",
      status: "confirmed",
      transactionHash: "0x9876...5432",
      roundTarget: 1000000,
      roundRaised: 1000000,
    },
  ];

  const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
  const activeInvestments = contributions.filter((c) => c.roundRaised < c.roundTarget).length;
  const completedInvestments = contributions.filter((c) => c.roundRaised >= c.roundTarget).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-primary/10 text-primary gap-1">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </Badge>
        );
      case "pending":
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Contribution History</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Track all your contributions and investment performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalInvested / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              Across {contributions.length} contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">Rounds in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedInvestments}</div>
            <p className="text-xs text-muted-foreground">Successfully funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Contributions by Round */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle>Your Contributions</CardTitle>
          <CardDescription>Detailed breakdown of all your investments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {contributions.map((contribution) => {
            const progress = (contribution.roundRaised / contribution.roundTarget) * 100;
            const isCompleted = progress >= 100;

            return (
              <div
                key={contribution.id}
                className="p-4 border border-border rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{contribution.roundName}</h3>
                      <Badge className={isCompleted ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}>
                        {isCompleted ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {contribution.company} • Contributed{" "}
                      {new Date(contribution.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      ${(contribution.amount / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-muted-foreground">{contribution.token}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Round Progress
                    </span>
                    <span className="font-medium">
                      ${(contribution.roundRaised / 1000000).toFixed(2)}M / $
                      {(contribution.roundTarget / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {progress.toFixed(1)}% funded
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contribution.status)}
                    <span className="text-xs text-muted-foreground">
                      TX: {contribution.transactionHash}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription className="text-sm">All contribution transactions in chronological order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">
                      {new Date(contribution.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contribution.roundName}</div>
                        <div className="text-sm text-muted-foreground">
                          {contribution.company}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${contribution.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{contribution.token}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {contribution.transactionHash}
                    </TableCell>
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
