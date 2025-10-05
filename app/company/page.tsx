import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, CircleDollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CompanyDashboard() {
  // Mock data - will be replaced with actual data from API
  const stats = [
    {
      title: "Total Raised",
      value: "$4.2M",
      change: "+12.5%",
      icon: CircleDollarSign,
    },
    {
      title: "Active Rounds",
      value: "2",
      change: "1 ending soon",
      icon: TrendingUp,
    },
    {
      title: "Total Investors",
      value: "47",
      change: "+8 this month",
      icon: Users,
    },
  ];

  const activeRounds = [
    {
      id: "1",
      name: "Seed Round",
      target: 5000000,
      raised: 3200000,
      minContribution: 10000,
      maxContribution: 100000,
      participants: 28,
      status: "active",
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
      endDate: "2025-12-31",
    },
  ];

  const recentActivity = [
    { investor: "John Smith", amount: 50000, round: "Seed Round", time: "2 hours ago" },
    { investor: "Sarah Johnson", amount: 75000, round: "Series A", time: "5 hours ago" },
    { investor: "Mike Chen", amount: 25000, round: "Seed Round", time: "1 day ago" },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your fundraising activity</p>
        </div>
        <Link href="/company/rounds/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            New Round
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
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

      {/* Active Rounds */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Rounds</CardTitle>
                <CardDescription>Monitor your ongoing fundraising rounds</CardDescription>
              </div>
              <Link href="/company/rounds">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeRounds.map((round) => {
              const progress = (round.raised / round.target) * 100;
              return (
                <div key={round.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{round.name}</h3>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {round.participants} participants • Ends{" "}
                        {new Date(round.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${(round.raised / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of ${(round.target / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% funded</span>
                    <span>
                      ${(round.minContribution / 1000).toFixed(0)}K - $
                      {(round.maxContribution / 1000).toFixed(0)}K per investor
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest contributions from investors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.investor}</p>
                    <p className="text-sm text-muted-foreground">{activity.round}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${activity.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
