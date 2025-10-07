'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { investors as investorsAPI } from "@/lib/api-client";

export default function InvestorProfilePage() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInvestorData();
  }, []);

  async function loadInvestorData() {
    if (!user) return;
    
    try {
      setLoading(true);
      // Use user.id from auth context
      const investor = await investorsAPI.get(user.id);
      setWalletAddress(investor.walletAddress || '');
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate wallet address format (basic validation)
    if (walletAddress && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setErrorMessage('Invalid wallet address format. It should start with "0x" followed by 40 hexadecimal characters.');
      return;
    }

    setSaving(true);
    try {
      await investorsAPI.update(user!.id, {
        walletAddress: walletAddress || null,
      });
      setSuccessMessage('Wallet address updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(typeof error === 'string' ? error : 'Failed to update wallet address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your investor profile and wallet information
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border bg-card flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{successMessage}</p>
          </div>
        )}

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Name</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.name || 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Contact your administrator to update your name or email.
            </p>
          </CardContent>
        </Card>

        {/* Wallet Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Address
            </CardTitle>
            <CardDescription>
              Add your Ethereum wallet address for receiving token distributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">
                Wallet Address
              </Label>
              <Input
                id="wallet-address"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your Ethereum wallet address (must start with "0x" followed by 40 characters)
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Double-check your wallet address before saving</li>
                  <li>This address will be used for token distributions</li>
                  <li>Ensure you have access to this wallet</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Wallet Address'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
