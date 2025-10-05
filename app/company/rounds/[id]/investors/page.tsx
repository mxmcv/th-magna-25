"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Search, MoreVertical, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { mockRounds, mockContributions, mockInvestors } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function RoundInvestorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Find the round
  const round = mockRounds.find((r) => r.id === id);

  if (!round) {
    return (
      <div className="p-4 md:p-6 lg:p-8 text-center text-muted-foreground">
        Round not found.
      </div>
    );
  }

  // Get all contributions for this round
  const roundContributions = mockContributions.filter(
    (c) => c.roundId === round.id
  );

  // Get investors who contributed to this round
  const roundInvestors = mockInvestors
    .filter((investor) =>
      roundContributions.some((c) => c.investorId === investor.id)
    )
    .map((investor) => {
      const contributions = roundContributions.filter(
        (c) => c.investorId === investor.id
      );
      const totalContributed = contributions.reduce(
        (sum, c) => sum + c.amount,
        0
      );
      return {
        ...investor,
        totalContributed,
        contributions,
      };
    });

  const filteredInvestors = roundInvestors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/company/rounds/${id}`}>
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Round Details
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">Investors</h1>
              <StatusBadge status={round.status} />
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {round.name} • {filteredInvestors.length} investors
            </p>
          </div>
          <Link href="/company/investors/invite">
            <Button className="gap-2 w-full sm:w-auto">
              <UserPlus className="w-4 h-4" />
              Invite More Investors
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roundInvestors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(round.raised / 1000000).toFixed(2)}M
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
              ${roundInvestors.length > 0 ? (round.raised / roundInvestors.length / 1000).toFixed(0) : 0}K
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((round.raised / round.target) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investors Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Investor List</CardTitle>
              <CardDescription className="text-sm">
                All investors who contributed to this round
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search investors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contributed</TableHead>
                  <TableHead className="text-right">Contributions</TableHead>
                  <TableHead className="text-right">First Contribution</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{investor.name}</div>
                        <div className="text-sm text-muted-foreground">{investor.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/10 text-green-500">
                        Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(investor.totalContributed)}
                    </TableCell>
                    <TableCell className="text-right">
                      {investor.contributions.length}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDate(investor.contributions[0]?.contributedAt || investor.joinedDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/company/investors/${investor.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push("/company/investors/invite")}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Contributions</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvestors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No investors found matching your search."
                : "No investors have contributed to this round yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

