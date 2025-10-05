'use client';

import { User, LayoutDashboard, CircleDollarSign, History, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-64 border-r border-border bg-card flex-col">
        <div className="p-6">
          <div className="mb-6 pl-3">
            <Link href="/" className="inline-flex">
              <Home className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
          </div>
          
          <nav className="space-y-1">
            <Link href="/investor">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname === '/investor' 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/investor/rounds">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/investor/rounds') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <CircleDollarSign className="w-5 h-5 mr-3" />
                Available Rounds
              </Button>
            </Link>
            <Link href="/investor/history">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/investor/history') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                My Contributions
              </Button>
            </Link>
          </nav>
        </div>

        <Separator />

        <div className="p-6">
          <div className="text-xs text-muted-foreground mb-2">Investor Portal</div>
          <div className="text-sm font-medium">Demo Investor</div>
          <div className="text-xs text-muted-foreground">investor@example.com</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="p-4 flex items-center justify-center border-b border-border">
          <div className="text-sm font-medium">Investor Portal</div>
        </div>
        <div className="flex">
          <Link href="/investor" className="flex-1">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/investor/rounds" className="flex-1 border-l border-border">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs">
              <CircleDollarSign className="w-4 h-4 mr-2" />
              Rounds
            </Button>
          </Link>
          <Link href="/investor/history" className="flex-1 border-l border-border">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
