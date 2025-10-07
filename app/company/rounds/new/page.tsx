"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, Calendar, Coins, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { rounds as roundsAPI } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function NewRoundPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Client-side validation
    const target = parseFloat(formData.target);
    const minContribution = parseFloat(formData.minContribution);
    const maxContribution = parseFloat(formData.maxContribution);
    const selectedTokens = Object.keys(formData.acceptedTokens).filter(
      (token) => formData.acceptedTokens[token as keyof typeof formData.acceptedTokens]
    );

    if (isNaN(target) || target <= 0) {
      setErrorMessage('Please enter a valid fundraising target greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(minContribution) || minContribution <= 0) {
      setErrorMessage('Please enter a valid minimum contribution greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(maxContribution) || maxContribution <= 0) {
      setErrorMessage('Please enter a valid maximum contribution greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (minContribution > maxContribution) {
      setErrorMessage('Minimum contribution cannot be greater than maximum contribution');
      setIsSubmitting(false);
      return;
    }

    if (maxContribution > target) {
      setErrorMessage('Maximum contribution cannot exceed the fundraising target');
      setIsSubmitting(false);
      return;
    }

    if (selectedTokens.length === 0) {
      setErrorMessage('Please select at least one accepted stablecoin');
      setIsSubmitting(false);
      return;
    }

    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      setErrorMessage('Please select both start and end dates');
      setIsSubmitting(false);
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time for comparison

    // Check if dates are valid
    if (isNaN(startDate.getTime())) {
      setErrorMessage('Please enter a valid start date');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(endDate.getTime())) {
      setErrorMessage('Please enter a valid end date');
      setIsSubmitting(false);
      return;
    }

    // Check year range (must be between 1900 and 2100)
    if (startDate.getFullYear() < 1900 || startDate.getFullYear() > 2100) {
      setErrorMessage('Start date year must be between 1900 and 2100');
      setIsSubmitting(false);
      return;
    }

    if (endDate.getFullYear() < 1900 || endDate.getFullYear() > 2100) {
      setErrorMessage('End date year must be between 1900 and 2100');
      setIsSubmitting(false);
      return;
    }

    if (startDate >= endDate) {
      setErrorMessage('End date must be after start date');
      setIsSubmitting(false);
      return;
    }

    try {
      await roundsAPI.create({
        name: formData.name,
        description: formData.description || undefined,
        target,
        minContribution,
        maxContribution,
        acceptedTokens: selectedTokens,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'ACTIVE',
      });
      router.push('/company/rounds');
    } catch (error) {
      setErrorMessage(typeof error === 'string' ? error : 'Failed to create round. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Link href="/company/rounds">
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Rounds
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Create New Round</h1>
        <p className="text-sm md:text-base text-muted-foreground">Set up a new fundraising round for your project</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of this fundraising round..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Provide context for investors
                </p>
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
                    min="1900-01-01"
                    max="2100-12-31"
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
                    min="1900-01-01"
                    max="2100-12-31"
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
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Link href="/company/rounds" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 h-11" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Round'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
