import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users2, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Magna Fundraising Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamlined fundraising management for Web3 projects. Manage rounds, track contributions, and maintain compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Building2 className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Company Portal</CardTitle>
              <CardDescription>
                Create and manage fundraising rounds with real-time tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users2 className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Investor Management</CardTitle>
              <CardDescription>
                Track contributions, send invitations, and manage investor relationships
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Real-Time Analytics</CardTitle>
              <CardDescription>
                Monitor fundraising progress with comprehensive dashboards and metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Audit & Compliance</CardTitle>
              <CardDescription>
                Complete audit trails for all operations with role-based access control
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}