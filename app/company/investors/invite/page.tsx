"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Mail, UserPlus, Copy, Check, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { rounds as roundsAPI, investors as investorsAPI } from "@/lib/api-client";

export default function InviteInvestorsPage() {
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [invitationLinks, setInvitationLinks] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [roundsData, investorsData] = await Promise.all([
          roundsAPI.list(),
          investorsAPI.list(),
        ]);
        // Only show active rounds for invitations
        setRounds(roundsData.filter((r: any) => r.status === 'ACTIVE'));
        setInvestors(investorsData);
      } catch {
        // Silently fail - user will see empty lists
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRoundToggle = (roundId: string) => {
    setSelectedRounds(prev =>
      prev.includes(roundId)
        ? prev.filter(id => id !== roundId)
        : [...prev, roundId]
    );
  };

  const handleInvestorToggle = (investorId: string) => {
    setSelectedInvestors(prev =>
      prev.includes(investorId)
        ? prev.filter(id => id !== investorId)
        : [...prev, investorId]
    );
  };

  const handleBulkInvite = async () => {
    setErrorMessage("");
    
    if (selectedRounds.length === 0) {
      setErrorMessage('Please select at least one round');
      return;
    }

    if (selectedInvestors.length === 0) {
      setErrorMessage('Please select at least one investor');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          investorIds: selectedInvestors,
          roundIds: selectedRounds,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create invitations');
      }

      // Group invitations by investor
      const invitesByInvestor = new Map();
      result.data.invitations.forEach((inv: any) => {
        const investorId = inv.investor.id;
        if (!invitesByInvestor.has(investorId)) {
          invitesByInvestor.set(investorId, {
            investor: inv.investor,
            link: inv.invitationLink,
            rounds: []
          });
        }
        invitesByInvestor.get(investorId).rounds.push(inv.round.name);
      });

      setInvitationLinks(Array.from(invitesByInvestor.values()));
      setSuccessMessage(result.data.message);
      setShowSuccessDialog(true);
      setSelectedInvestors([]);
      setSelectedRounds([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create invitations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const walletAddress = formData.get('wallet') as string;
    
    if (!email) {
      setErrorMessage('Please enter an email address');
      return;
    }
    
    if (!name) {
      setErrorMessage('Please enter a name');
      return;
    }
    
    if (selectedRounds.length === 0) {
      setErrorMessage('Please select at least one round');
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

      // Create invitations
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

      const firstInvitation = result.data.invitations[0];
      setInvitationLinks([{
        investor: result.data.investors[0],
        link: firstInvitation.invitationLink,
        rounds: result.data.invitations.map((inv: any) => inv.round.name)
      }]);
      setSuccessMessage(result.data.message);
      setShowSuccessDialog(true);
      setSelectedRounds([]);
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async (link: string, index: number) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkIndex(index);
      setTimeout(() => setCopiedLinkIndex(null), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/company/investors">
        <Button variant="ghost" size="sm" className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Investors
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Invite Investors</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Invite new investors or select from existing ones to participate in rounds
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {errorMessage}
        </div>
      )}

      <Tabs defaultValue="bulk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk">
            <Users className="w-4 h-4 mr-2" />
            Bulk Invite
          </TabsTrigger>
          <TabsTrigger value="single">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite New
          </TabsTrigger>
        </TabsList>

        {/* Bulk Invite Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Investors</CardTitle>
              <CardDescription>Choose existing investors to invite</CardDescription>
            </CardHeader>
            <CardContent>
              {investors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No investors found. Create a new investor using the "Invite New" tab.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {investors.map((investor) => (
                    <div
                      key={investor.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedInvestors.includes(investor.id)}
                        onCheckedChange={() => handleInvestorToggle(investor.id)}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleInvestorToggle(investor.id)}>
                        <div className="font-medium">{investor.name}</div>
                        <div className="text-sm text-muted-foreground">{investor.email}</div>
                      </div>
                      {investor.status && (
                        <Badge variant="outline" className="text-xs">
                          {investor.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedInvestors.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {selectedInvestors.length} investor(s) selected
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Rounds</CardTitle>
              <CardDescription>Choose which rounds to invite investors to</CardDescription>
            </CardHeader>
            <CardContent>
              {rounds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rounds available. Create a round first.
                </p>
              ) : (
                <div className="space-y-2">
                  {rounds.map((round) => (
                    <div
                      key={round.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedRounds.includes(round.id)}
                        onCheckedChange={() => handleRoundToggle(round.id)}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleRoundToggle(round.id)}>
                        <div className="font-medium">{round.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(round.target / 1000000).toFixed(1)}M target
                        </div>
                      </div>
                      <Badge variant="secondary">{round.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {selectedRounds.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {selectedRounds.length} round(s) selected
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleBulkInvite}
              disabled={isSubmitting || selectedInvestors.length === 0 || selectedRounds.length === 0}
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Generating...' : `Generate ${selectedInvestors.length > 0 ? selectedInvestors.length : ''} Link${selectedInvestors.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </TabsContent>

        {/* Single Invite Tab */}
        <TabsContent value="single" className="space-y-6">
          <form onSubmit={handleSingleInvite} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investor Details</CardTitle>
                <CardDescription>Enter the details of the new investor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="investor@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address (Optional)</Label>
                  <Input
                    id="wallet"
                    name="wallet"
                    type="text"
                    placeholder="0x..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Rounds</CardTitle>
                <CardDescription>Choose which rounds to invite this investor to</CardDescription>
              </CardHeader>
              <CardContent>
                {rounds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No rounds available. Create a round first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rounds.map((round) => (
                      <div
                        key={round.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedRounds.includes(round.id)}
                          onCheckedChange={() => handleRoundToggle(round.id)}
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => handleRoundToggle(round.id)}>
                          <div className="font-medium">{round.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${(round.target / 1000000).toFixed(1)}M target
                          </div>
                        </div>
                        <Badge variant="secondary">{round.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {selectedRounds.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {selectedRounds.length} round(s) selected
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || selectedRounds.length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Generating...' : 'Generate Invitation Link'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Invitation Links Generated
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {invitationLinks.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{item.investor.name}</CardTitle>
                  <CardDescription>{item.investor.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Invited to:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.rounds.map((roundName: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {roundName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Invitation Link:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={item.link}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(item.link, index)}
                      >
                        {copiedLinkIndex === index ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
