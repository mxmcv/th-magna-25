"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, FileJson, FileSpreadsheet, Coins, Calculator, AlertCircle, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { DetailViewSkeleton } from "@/components/skeletons";

interface TokenAllocation {
  investorId: string;
  investorName: string;
  investorEmail: string;
  walletAddress?: string;
  contributionAmount: number;
  tokenAmount: number;
  percentage: number;
}

export default function TokenAllocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [round, setRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [allocations, setAllocations] = useState<TokenAllocation[]>([]);
  const [tokenPrice, setTokenPrice] = useState("");
  const [vestingCliff, setVestingCliff] = useState("12");
  const [vestingDuration, setVestingDuration] = useState("24");
  const [tgeUnlock, setTgeUnlock] = useState("10");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadRound();
  }, [id]);

  async function loadRound() {
    try {
      const response = await fetch(`/api/rounds/${id}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setRound(data.data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!tokenPrice || parseFloat(tokenPrice) <= 0) {
      setErrorMessage("Please enter a valid token price");
      return;
    }

    setGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/rounds/${id}/token-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tokenPrice: parseFloat(tokenPrice),
          vestingConfig: {
            cliff: parseInt(vestingCliff),
            duration: parseInt(vestingDuration),
            tge: parseFloat(tgeUnlock),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAllocations(data.data.allocations);
        setSuccessMessage("Token allocation calculated successfully!");
      } else {
        setErrorMessage(data.error?.message || "Failed to generate allocation");
      }
    } catch (error) {
      setErrorMessage(typeof error === 'string' ? error : "Failed to generate allocation");
    } finally {
      setGenerating(false);
    }
  }

  function exportToCSV() {
    if (allocations.length === 0) return;

    const headers = [
      'Investor Name',
      'Email',
      'Wallet Address',
      'Contribution (USD)',
      'Token Amount',
      'Percentage',
      'Cliff (months)',
      'Vesting Duration (months)',
      'TGE Unlock %',
      'Notes',
    ];

    const rows = allocations.map((alloc) => [
      alloc.investorName,
      alloc.investorEmail,
      alloc.walletAddress || '',
      alloc.contributionAmount.toFixed(2),
      alloc.tokenAmount.toFixed(6),
      alloc.percentage.toFixed(4),
      vestingCliff,
      vestingDuration,
      tgeUnlock,
      `${round.name} - Generated ${new Date().toLocaleDateString()}`,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${round.name.replace(/\s+/g, '-')}-token-allocation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    setSuccessMessage("CSV exported successfully!");
  }

  function exportToJSON() {
    if (allocations.length === 0) return;

    const totalTokens = allocations.reduce((sum, a) => sum + a.tokenAmount, 0);
    
    const jsonData = {
      metadata: {
        roundId: round.id,
        roundName: round.name,
        totalRaised: round.raised,
        totalTokens,
        tokenPrice: parseFloat(tokenPrice),
        generatedAt: new Date().toISOString(),
        exportVersion: '1.0',
        platform: 'Magna Fundraising Platform',
      },
      vestingSchedule: {
        cliff: parseInt(vestingCliff),
        duration: parseInt(vestingDuration),
        tgeUnlock: parseFloat(tgeUnlock),
      },
      allocations: allocations.map((alloc) => ({
        investor: {
          id: alloc.investorId,
          name: alloc.investorName,
          email: alloc.investorEmail,
          walletAddress: alloc.walletAddress || null,
        },
        contribution: {
          amount: alloc.contributionAmount,
          currency: 'USD',
        },
        tokens: {
          amount: alloc.tokenAmount,
          percentage: alloc.percentage,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${round.name.replace(/\s+/g, '-')}-token-allocation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    setSuccessMessage("JSON exported successfully!");
  }

  if (loading) return <DetailViewSkeleton />;

  if (!round) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Round not found</p>
      </div>
    );
  }

  const totalTokens = allocations.reduce((sum, a) => sum + a.tokenAmount, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Link href={`/company/rounds/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Round Details
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">Token Allocation</h1>
          <Badge variant="outline" className="gap-1">
            <Coins className="w-3 h-3" />
            {round.name}
          </Badge>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Calculate and export token distribution for investor allocations
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg border bg-card flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary" />
          <p className="text-sm flex-1">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive flex-1">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage("")}
            className="text-destructive hover:text-destructive/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allocation Configuration</CardTitle>
          <CardDescription>
            Configure token price and vesting schedule for investor allocations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tokenPrice">
                Token Price (USD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</div>
                <Input
                  id="tokenPrice"
                  type="number"
                  step="0.000001"
                  placeholder="0.50"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Price per token for calculating allocations
              </p>
            </div>
            
            <div className="space-y-4 pt-7">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Raised</p>
                <p className="text-2xl font-bold">${(round.raised / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground mt-1">{round.participants || 0} participants</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-4">Vesting Schedule (Optional)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliff">Cliff Period (months)</Label>
                <Input
                  id="cliff"
                  type="number"
                  value={vestingCliff}
                  onChange={(e) => setVestingCliff(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Vesting Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={vestingDuration}
                  onChange={(e) => setVestingDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tge">TGE Unlock (%)</Label>
                <Input
                  id="tge"
                  type="number"
                  step="0.1"
                  value={tgeUnlock}
                  onChange={(e) => setTgeUnlock(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These parameters will be included in the export for Magna's vesting platform
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !tokenPrice}
            className="w-full gap-2"
          >
            <Calculator className="w-4 h-4" />
            {generating ? "Calculating..." : "Calculate Token Allocation"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {allocations.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Total Tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTokens.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Token Price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${parseFloat(tokenPrice).toFixed(4)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Investors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allocations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Total Raised</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(round.raised / 1000000).toFixed(2)}M</div>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Export to Magna Platform</CardTitle>
              <CardDescription>
                Download token allocation data in formats compatible with Magna's vesting platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={exportToCSV} variant="outline" className="flex-1 gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as CSV
                </Button>
                <Button onClick={exportToJSON} variant="outline" className="flex-1 gap-2">
                  <FileJson className="w-4 h-4" />
                  Export as JSON
                </Button>
              </div>
              <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Ready for Magna Integration</p>
                <p className="text-xs text-muted-foreground">
                  These exports are formatted to seamlessly import into Magna's vesting and custody platform for token distribution setup.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Token Allocation Breakdown</CardTitle>
              <CardDescription>
                Detailed allocation per investor based on contribution amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead className="text-right">Contribution</TableHead>
                        <TableHead className="text-right">Token Amount</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                        <TableHead>Wallet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((alloc) => (
                        <TableRow key={alloc.investorId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{alloc.investorName}</div>
                              <div className="text-xs text-muted-foreground">{alloc.investorEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${alloc.contributionAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {alloc.tokenAmount.toLocaleString(undefined, {maximumFractionDigits: 6})}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{alloc.percentage.toFixed(2)}%</Badge>
                          </TableCell>
                          <TableCell>
                            {alloc.walletAddress ? (
                              <span className="text-xs font-mono">{alloc.walletAddress.substring(0, 10)}...</span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not provided</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
