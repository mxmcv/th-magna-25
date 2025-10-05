import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Magna Fundraising
          </h1>
          <p className="text-muted-foreground text-lg">
            Streamlined fundraising management for Web3 projects
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/company" className="group">
            <Card className="h-full hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Company Portal</CardTitle>
                <CardDescription className="text-base">
                  Manage fundraising rounds and track investor contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" size="lg">
                  Access Company Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investor" className="group">
            <Card className="h-full hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Investor Portal</CardTitle>
                <CardDescription className="text-base">
                  View available rounds and manage your contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" size="lg">
                  Access Investor Portal
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Track fundraising, manage investors, and streamline your Web3 capital journey</p>
        </div>
      </div>
    </div>
  );
}