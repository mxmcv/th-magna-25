"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, UserPlus, Send, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function InviteInvestorsPage() {
  const [inviteType, setInviteType] = useState<"single" | "bulk">("single");
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);

  // Mock rounds data
  const rounds = [
    { id: "1", name: "Seed Round", status: "ACTIVE" },
    { id: "2", name: "Series A", status: "ACTIVE" },
    { id: "3", name: "Pre-Seed", status: "COMPLETED" },
  ];

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes("@")) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending invitations to:", emails, "for rounds:", selectedRounds);
    // Will implement API call later
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Invite Investors</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Send invitations to participate in your fundraising rounds
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invitation Type */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Invitation Type</CardTitle>
                  <CardDescription>Choose how you want to send invitations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setInviteType("single")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    inviteType === "single"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Single Invite</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Invite one investor at a time
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setInviteType("bulk")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    inviteType === "bulk"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Send className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Bulk Invite</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Invite multiple investors
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

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
                    {inviteType === "single"
                      ? "Enter investor information"
                      : "Add multiple email addresses"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {inviteType === "single" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="John Smith" required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
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
                      placeholder="0x..."
                      className="h-11 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Can be added later by the investor
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email-input">Email Addresses</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email-input"
                        type="email"
                        placeholder="Enter email and press Add"
                        value={currentEmail}
                        onChange={(e) => setCurrentEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEmail();
                          }
                        }}
                        className="h-11"
                      />
                      <Button type="button" onClick={handleAddEmail} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {emails.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Added Emails ({emails.length})
                      </Label>
                      <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                        {emails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded"
                          >
                            <span className="text-sm">{email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEmail(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Round Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Round</CardTitle>
                  <CardDescription>
                    Choose which fundraising round to invite investors to
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="round">
                  Fundraising Round <span className="text-destructive">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a round" />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds
                      .filter((r) => r.status === "ACTIVE")
                      .map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                          <div className="flex items-center gap-2">
                            {round.name}
                            <Badge className="bg-primary/10 text-primary text-xs">Active</Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to your invitation..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included in the invitation email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Invitation Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipients:</span>
                <span className="font-medium">
                  {inviteType === "single" ? "1 investor" : `${emails.length} investors`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Round:</span>
                <span className="font-medium">Selected round</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invitation Type:</span>
                <span className="font-medium">
                  {inviteType === "single" ? "Individual" : "Bulk"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Link href="/company/investors" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 h-11 gap-2">
              <Send className="w-4 h-4" />
              Send {inviteType === "bulk" && emails.length > 0 ? `${emails.length} ` : ""}
              Invitation{inviteType === "bulk" && emails.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

