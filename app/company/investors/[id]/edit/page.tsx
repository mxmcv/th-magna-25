"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { investors as investorsAPI } from "@/lib/api-client";

export default function EditInvestorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    walletAddress: "",
  });

  useEffect(() => {
    async function loadInvestor() {
      try {
        const investor: any = await investorsAPI.get(id);
        setFormData({
          name: investor.name,
          email: investor.email,
          walletAddress: investor.walletAddress || "",
        });
      } catch (error) {
        setErrorMessage(typeof error === 'string' ? error : 'Failed to load investor data');
      } finally {
        setLoading(false);
      }
    }
    loadInvestor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Client-side validation
    if (!formData.name || formData.name.trim().length === 0) {
      setErrorMessage('Please enter a valid name');
      setIsSubmitting(false);
      return;
    }

    if (formData.walletAddress && formData.walletAddress.trim().length > 0) {
      // Basic wallet address validation (starts with 0x and has at least 42 characters)
      if (!formData.walletAddress.startsWith('0x') || formData.walletAddress.length < 42) {
        setErrorMessage('Please enter a valid Ethereum wallet address (must start with 0x and be at least 42 characters)');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await investorsAPI.update(id, {
        name: formData.name.trim(),
        walletAddress: formData.walletAddress && formData.walletAddress.trim().length > 0 
          ? formData.walletAddress.trim() 
          : undefined,
      });
      router.push(`/company/investors/${id}`);
    } catch (error) {
      setErrorMessage(typeof error === 'string' ? error : 'Failed to update investor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Link href={`/company/investors/${id}`}>
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Investor Details
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Edit Investor</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Update investor information and settings
        </p>
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

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription>
                Basic details about the investor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <Separator />
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    disabled
                    className="h-11 pl-10 bg-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed after account creation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                Wallet Information
              </CardTitle>
              <CardDescription>
                Cryptocurrency wallet address
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="walletAddress" className="text-sm font-medium">
                  Wallet Address (Optional)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <Input
                    id="walletAddress"
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, walletAddress: e.target.value })
                    }
                    className="h-11 pl-10 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ethereum wallet address for receiving contributions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Link href={`/company/investors/${id}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 h-11" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

