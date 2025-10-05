import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Users, Target } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoundsPage() {
  // Mock data
  const rounds = [
    {
      id: "1",
      name: "Seed Round",
      target: 5000000,
      raised: 3200000,
      minContribution: 10000,
      maxContribution: 100000,
      participants: 28,
      status: "active",
      acceptedTokens: ["USDC", "USDT"],
      startDate: "2025-09-01",
      endDate: "2025-11-30",
    },
    {
      id: "2",
      name: "Series A",
      target: 10000000,
      raised: 1000000,
      minContribution: 50000,
      maxContribution: 500000,
      participants: 5,
      status: "active",
      acceptedTokens: ["USDC", "USDT"],
      startDate: "2025-10-01",
      endDate: "2025-12-31",
    },
    {
      id: "3",
      name: "Pre-Seed",
      target: 1000000,
      raised: 1000000,
      minContribution: 5000,
      maxContribution: 50000,
      participants: 14,
      status: "completed",
      acceptedTokens: ["USDC"],
      startDate: "2025-06-01",
      endDate: "2025-08-31",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fundraising Rounds</h1>
          <p className="text-muted-foreground">Create and manage your fundraising rounds</p>
        </div>
        <Link href="/company/rounds/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Round
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {rounds.map((round) => {
          const progress = (round.raised / round.target) * 100;
          const isActive = round.status === "active";

          return (
            <Card key={round.id} className={isActive ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{round.name}</CardTitle>
                      <Badge className={getStatusColor(round.status)}>
                        {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(round.startDate).toLocaleDateString()} -{" "}
                      {new Date(round.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Round</DropdownMenuItem>
                      <DropdownMenuItem>Manage Investors</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Close Round
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      ${(round.raised / 1000000).toFixed(2)}M / $
                      {(round.target / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% funded</span>
                    <span>
                      ${((round.target - round.raised) / 1000000).toFixed(2)}M remaining
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="w-4 h-4" />
                      Participants
                    </div>
                    <div className="text-2xl font-bold">{round.participants}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Target className="w-4 h-4" />
                      Min/Max
                    </div>
                    <div className="text-lg font-semibold">
                      ${round.minContribution / 1000}K - ${round.maxContribution / 1000}K
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">Accepted Tokens</div>
                    <div className="flex gap-1">
                      {round.acceptedTokens.map((token) => (
                        <Badge key={token} variant="outline" className="text-xs">
                          {token}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">Avg Contribution</div>
                    <div className="text-lg font-semibold">
                      ${((round.raised / round.participants) / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isActive && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Investors
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Invite Investors
                    </Button>
                    <Button className="flex-1">View Details</Button>
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
