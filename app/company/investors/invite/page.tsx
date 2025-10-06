"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Mail, UserPlus, Link as LinkIcon, X, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { rounds as roundsAPI, investors as investorsAPI } from "@/lib/api-client";

export default function InviteInvestorsPage() {
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [investorInfo, setInvestorInfo] = useState<any>(null);

  useEffect(() => {
    async function loadRounds() {
      try {
        const data = await roundsAPI.list();
        setRounds(data);
      } catch (error) {
        console.error('Failed to load rounds:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRounds();
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const walletAddress = formData.get('wallet') as string;
    
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    if (!name) {
      alert('Please enter a name');
      return;
    }
    
    if (selectedRounds.length === 0) {
      alert('Please select at least one round');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get investor
      let investor;
      try {
        investor = await investorsAPI.create({ 
          email, 
          name,
          walletAddress: walletAddress || undefined
        });
      } catch (err: any) {
        // If investor already exists, fetch them
        const allInvestors = await investorsAPI.list();
        investor = allInvestors.find((inv: any) => inv.email === email);
        if (!investor) {
          throw new Error('Failed to create or find investor');
        }
      }

      // Create invitations for selected rounds
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          investorId: investor.id,
          roundIds: selectedRounds,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create invitations');
      }

      // Get the first invitation link (all have same investor, just different rounds)
      const firstInvitation = result.data.invitations[0];
      setInvitationLink(firstInvitation.invitationLink);
      setInvestorInfo(result.data.investor);
      setShowInviteDialog(true);
      
      // Reset form
      form.reset();
      setSelectedRounds([]);
    } catch (error: any) {
      console.error('Failed to create invitation:', error);
      alert(error.message || 'Failed to create invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link href="/company/investors">
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Investors
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Invite Investor</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Generate a unique invitation link for an investor to join your fundraising rounds
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investor Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Investor Details</CardTitle>
                  <CardDescription>
                    Enter investor information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="John Smith" 
                  required 
                  className="h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address (Optional)</Label>
                <Input
                  id="wallet"
                  name="wallet"
                  placeholder="0x..."
                  className="h-11 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Can be added later by the investor
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Round Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Rounds</CardTitle>
                  <CardDescription>
                    Choose which fundraising rounds to give access to
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="round">
                  Fundraising Rounds <span className="text-destructive">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => {
                    if (value && !selectedRounds.includes(value)) {
                      setSelectedRounds([...selectedRounds, value]);
                    }
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds
                      .filter((r) => r.status === "ACTIVE" || r.status === "DRAFT")
                      .map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                          <div className="flex items-center gap-2">
                            {round.name}
                            <Badge className="bg-primary/10 text-primary text-xs">{round.status}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The investor will only be able to view and contribute to the selected rounds
                </p>
              </div>

              {/* Show selected rounds */}
              {selectedRounds.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Selected Rounds ({selectedRounds.length})
                  </Label>
                  <div className="border rounded-lg p-3 space-y-2">
                    {selectedRounds.map((roundId) => {
                      const round = rounds.find((r) => r.id === roundId);
                      return (
                        <div
                          key={roundId}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <span className="text-sm">{round?.name || 'Unknown Round'}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRounds(selectedRounds.filter(id => id !== roundId))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Link href="/company/investors" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1 h-11 gap-2" 
              disabled={isSubmitting || selectedRounds.length === 0}
            >
              <LinkIcon className="w-4 h-4" />
              {isSubmitting ? 'Generating...' : 'Generate Invitation Link'}
            </Button>
          </div>
        </form>

        {/* Invitation Link Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <span>Invitation Link Generated</span>
              </DialogTitle>
              <DialogDescription>
                Share this unique link with {investorInfo?.name || 'the investor'}. It will expire in 7 days.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Investor Info */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Investor:</span>
                  <span className="font-medium">{investorInfo?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium text-sm">{investorInfo?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rounds:</span>
                  <span className="font-medium">{selectedRounds.length}</span>
                </div>
              </div>

              {/* Invitation Link */}
              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copiedLink && (
                  <p className="text-xs text-green-500">Link copied to clipboard!</p>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the invitation link above</li>
                  <li>Email it to {investorInfo?.email}</li>
                  <li>The investor will use it to create their account</li>
                  <li>They'll set a password and gain access to their invited rounds</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowInviteDialog(false)}>
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

