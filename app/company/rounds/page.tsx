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
import { StatusBadge } from "@/components/dashboard/status-badge";
import { mockRounds } from "@/lib/mock-data";
import { formatCompactCurrency, formatDate, calculatePercentage } from "@/lib/formatters";

export default function RoundsPage() {
  const rounds = mockRounds;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Fundraising Rounds</h1>
          <p className="text-sm md:text-base text-muted-foreground">Create and manage your fundraising rounds</p>
        </div>
        <Link href="/company/rounds/new">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create Round
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:gap-6">
        {rounds.map((round) => {
          const progress = (round.raised / round.target) * 100;
          const isActive = round.status === "active";

          return (
            <Card key={round.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{round.name}</CardTitle>
                      <StatusBadge status={round.status} />
                    </div>
                    <CardDescription>
                      {formatDate(round.startDate)} - {formatDate(round.endDate)}
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
                      {formatCompactCurrency(round.raised)} / {formatCompactCurrency(round.target)}
                    </span>
                  </div>
                  <Progress value={calculatePercentage(round.raised, round.target)} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{calculatePercentage(round.raised, round.target)}% funded</span>
                    <span>
                      {formatCompactCurrency(round.target - round.raised)} remaining
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
