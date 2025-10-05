"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NewRoundPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement API call later
    console.log("Creating round:", formData);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/company/rounds">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Rounds
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Round</h1>
        <p className="text-muted-foreground">Set up a new fundraising round for your project</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Round Details</CardTitle>
              <CardDescription>
                Configure the parameters for your fundraising round
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Round Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Round Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Seed Round, Series A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="target">Target Amount (USD)</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="5000000"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Total amount you aim to raise in this round
                </p>
              </div>

              {/* Contribution Limits */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minContribution">Minimum Contribution (USD)</Label>
                  <Input
                    id="minContribution"
                    type="number"
                    placeholder="10000"
                    value={formData.minContribution}
                    onChange={(e) =>
                      setFormData({ ...formData, minContribution: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxContribution">Maximum Contribution (USD)</Label>
                  <Input
                    id="maxContribution"
                    type="number"
                    placeholder="100000"
                    value={formData.maxContribution}
                    onChange={(e) =>
                      setFormData({ ...formData, maxContribution: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Accepted Tokens */}
              <div className="space-y-2">
                <Label>Accepted Stablecoins</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
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
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm font-medium">USDC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
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
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm font-medium">USDT</span>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which stablecoins investors can use for contributions
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Link href="/company/rounds" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1">
              Create Round
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
