'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Lock, Mail, User } from "lucide-react";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const response = await fetch(`/api/invitations/accept?token=${token}`, {
        credentials: 'include',
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || 'Invalid or expired invitation');
        return;
      }

      setInvitationData(result.data);
    } catch (err) {
      setError('Failed to validate invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || 'Failed to accept invitation');
        return;
      }

      // Redirect to investor dashboard
      router.push('/investor');
    } catch (err) {
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Accept Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to participate in fundraising rounds. Set up your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Investor Info */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Account Information</span>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{invitationData?.investor?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium text-sm">{invitationData?.investor?.email}</span>
              </div>
            </div>
          </div>

          {/* Invited Rounds */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">You've been invited to {invitationData?.rounds?.length || 0} round(s)</span>
            </div>
            <div className="grid gap-2">
              {invitationData?.rounds?.map((round: any) => (
                <div key={round.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{round.name}</h4>
                      {round.description && (
                        <p className="text-sm text-muted-foreground mt-1">{round.description}</p>
                      )}
                    </div>
                    <Badge className="bg-primary/10 text-primary">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Password Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Create Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                By creating an account, you'll be able to view the invited rounds and make contributions.
                You can log in anytime using your email and this password.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

