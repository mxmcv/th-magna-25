'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Plus,
  TrendingUp,
  Users,
  CircleDollarSign,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  formatCompactCurrency,
  formatCurrency,
  calculatePercentage,
  formatRelativeTime,
} from '@/lib/formatters';
import {
  rounds as roundsAPI,
  contributions as contributionsAPI,
} from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';

interface ProcessedContribution {
  id: string;
  investor: string;
  amount: number;
  round: string;
  time: string;
}

export default function CompanyDashboard() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ProcessedContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [roundsData, contributionsData] = await Promise.all([
          roundsAPI.list(),
          contributionsAPI.list(),
        ]);

        setRounds(roundsData);

        // Process recent contributions
        const recent: ProcessedContribution[] = contributionsData
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            investor: c.investor?.name || 'Unknown',
            amount: c.amount || 0,
            round: c.round?.name || 'Unknown Round',
            time: formatRelativeTime(c.contributedAt),
          }));
        setRecentActivity(recent);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Filter active rounds
  const activeRounds = rounds.filter((round: any) => round.status === 'ACTIVE');

  // Calculate stats
  const totalRaised = rounds.reduce((sum: number, r: any) => sum + (r.raised || 0), 0);
  const totalInvestors = new Set(recentActivity.map((a) => a.investor)).size;

  const statsConfig = [
    {
      title: 'Total Raised',
      value: formatCompactCurrency(totalRaised),
      subtitle: `Across ${rounds.length} rounds`,
      icon: CircleDollarSign,
    },
    {
      title: 'Active Rounds',
      value: activeRounds.length.toString(),
      subtitle: `${rounds.length - activeRounds.length} completed`,
      icon: TrendingUp,
    },
    {
      title: 'Total Investors',
      value: totalInvestors.toString(),
      subtitle: `${recentActivity.length} recent contributions`,
      icon: Users,
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Overview of your fundraising activity
          </p>
        </div>
        <Link href="/company/rounds/new">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create Round
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 md:mb-8">
        {statsConfig.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Active Rounds */}
      <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Rounds</CardTitle>
                <CardDescription>
                  Monitor your ongoing fundraising rounds
                </CardDescription>
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
            {activeRounds.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active rounds. Create a new round to start fundraising.
              </p>
            ) : (
              activeRounds.map((round) => {
                const progress = round.target > 0 ? (round.raised / round.target) * 100 : 0;
                return (
                <div key={round.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{round.name}</h3>
                        <StatusBadge status={round.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {round.participants} participants • Ends{' '}
                        {round.endDate
                          ? new Date(round.endDate).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCompactCurrency(round.raised)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCompactCurrency(round.target)}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={calculatePercentage(round.raised, round.target)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {calculatePercentage(round.raised, round.target)}% funded
                    </span>
                    <span>
                      {formatCompactCurrency(round.minContribution)} -{' '}
                      {formatCompactCurrency(round.maxContribution)} per
                      investor
                    </span>
                  </div>
                </div>
              );
            })
            )}
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
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.investor}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.round}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
