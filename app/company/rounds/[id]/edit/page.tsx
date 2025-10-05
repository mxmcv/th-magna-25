"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, Calendar, Coins } from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditRoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    minContribution: "",
    maxContribution: "",
    startDate: "",
    endDate: "",
    acceptedTokens: {
      USDC: true,
      USDT: true,
    },
  });

  // Fetch existing round data (mock for now)
  useEffect(() => {
    // Mock data - replace with API call
    const mockRound = {
      id: "1",
      name: "Seed Round",
      target: 5000000,
      minContribution: 10000,
      maxContribution: 100000,
      startDate: "2025-09-01",
      endDate: "2025-11-30",
      acceptedTokens: ["USDC", "USDT"],
    };

    // Simulate loading
    setTimeout(() => {
      setFormData({
        name: mockRound.name,
        target: mockRound.target.toString(),
        minContribution: mockRound.minContribution.toString(),
        maxContribution: mockRound.maxContribution.toString(),
        startDate: mockRound.startDate,
        endDate: mockRound.endDate,
        acceptedTokens: {
          USDC: mockRound.acceptedTokens.includes("USDC"),
          USDT: mockRound.acceptedTokens.includes("USDT"),
        },
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement API call later
    console.log("Updating round:", id, formData);
    router.push(`/company/rounds/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading round data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Link href={`/company/rounds/${id}`}>
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Round Details
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Edit Round</h1>
        <p className="text-sm md:text-base text-muted-foreground">Update fundraising round details</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                Basic Information
              </CardTitle>
              <CardDescription>
                Name your round and set the fundraising target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Round Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Round Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Seed Round, Series A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <Separator />

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="target" className="text-sm font-medium">
                  Fundraising Target <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </div>
                  <Input
                    id="target"
                    type="number"
                    placeholder="5,000,000"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    required
                    className="h-11 pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Total amount you aim to raise in USD
                </p>
              </div>

              <Separator />

              {/* Contribution Limits */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Contribution Limits</h4>
                  <p className="text-xs text-muted-foreground">
                    Set minimum and maximum investment amounts per investor
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minContribution" className="text-sm font-medium">
                      Minimum <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </div>
                      <Input
                        id="minContribution"
                        type="number"
                        placeholder="10,000"
                        value={formData.minContribution}
                        onChange={(e) =>
                          setFormData({ ...formData, minContribution: e.target.value })
                        }
                        required
                        className="h-11 pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxContribution" className="text-sm font-medium">
                      Maximum <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </div>
                      <Input
                        id="maxContribution"
                        type="number"
                        placeholder="100,000"
                        value={formData.maxContribution}
                        onChange={(e) =>
                          setFormData({ ...formData, maxContribution: e.target.value })
                        }
                        required
                        className="h-11 pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                Timeline
              </CardTitle>
              <CardDescription>
                Set the start and end dates for this fundraising round
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accepted Tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                Accepted Tokens
              </CardTitle>
              <CardDescription>
                Select which stablecoins investors can use for contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="relative flex items-center justify-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors bg-card has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTokens.USDC}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptedTokens: {
                            ...formData.acceptedTokens,
                            USDC: e.target.checked,
                          },
                        })
                      }
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-lg mb-1">USDC</div>
                      <div className="text-xs text-muted-foreground">USD Coin</div>
                    </div>
                    {formData.acceptedTokens.USDC && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </label>

                  <label className="relative flex items-center justify-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors bg-card has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTokens.USDT}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptedTokens: {
                            ...formData.acceptedTokens,
                            USDT: e.target.checked,
                          },
                        })
                      }
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-lg mb-1">USDT</div>
                      <div className="text-xs text-muted-foreground">Tether</div>
                    </div>
                    {formData.acceptedTokens.USDT && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  At least one stablecoin must be selected
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Link href={`/company/rounds/${id}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 h-11">
              Update Round
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

