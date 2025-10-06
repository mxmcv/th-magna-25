'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorPassword, setInvestorPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(companyEmail, companyPassword, 'company');
      router.push('/company');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(investorEmail, investorPassword, 'investor');
      router.push('/investor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to Magna</p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="investor">Investor</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Login</CardTitle>
                <CardDescription>
                  Access your company dashboard and manage fundraising rounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanyLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="demo@company.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-password">Password</Label>
                    <Input
                      id="company-password"
                      type="password"
                      placeholder="Enter your password"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                      Demo: demo@company.com / demo123
                    </p>
                  </div>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link href="/register" className="text-primary hover:underline">
                      Register
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investor">
            <Card>
              <CardHeader>
                <CardTitle>Investor Login</CardTitle>
                <CardDescription>
                  Access your investment portfolio and available opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvestorLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="investor-email">Email</Label>
                    <Input
                      id="investor-email"
                      type="email"
                      placeholder="john.smith@example.com"
                      value={investorEmail}
                      onChange={(e) => setInvestorEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investor-password">Password</Label>
                    <Input
                      id="investor-password"
                      type="password"
                      placeholder="Enter your password"
                      value={investorPassword}
                      onChange={(e) => setInvestorPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center text-sm">
                    <p className="text-muted-foreground text-xs">
                      Don't have an account? You'll receive an invitation link from your company.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

