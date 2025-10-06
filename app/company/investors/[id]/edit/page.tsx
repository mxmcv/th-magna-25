"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { investors as investorsAPI } from "@/lib/api-client";

export default function EditInvestorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    walletAddress: "",
  });

  useEffect(() => {
    async function loadInvestor() {
      try {
        const investor = await investorsAPI.get(id);
        setFormData({
          name: investor.name,
          email: investor.email,
          walletAddress: investor.walletAddress || "",
        });
      } catch (error) {
        console.error('Failed to load investor:', error);
        alert('Failed to load investor data');
      } finally {
        setLoading(false);
      }
    }
    loadInvestor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await investorsAPI.update(id, {
        name: formData.name,
        walletAddress: formData.walletAddress || undefined,
      });
      router.push(`/company/investors/${id}`);
    } catch (error) {
      console.error('Failed to update investor:', error);
      alert('Failed to update investor. Please try again.');
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
                  Email Address <span className="text-destructive">*</span>
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary email for communications and notifications
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

