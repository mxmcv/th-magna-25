'use client';

import { User, LayoutDashboard, CircleDollarSign, History, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-64 border-r border-border bg-card flex-col h-screen sticky top-0">
        <div className="p-6 flex-shrink-0">
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
            <Link href="/investor/profile">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/investor/profile') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex-shrink-0">
          <Separator />
          <div className="p-6 space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Investor Portal</div>
              <div className="text-sm font-medium">{user?.name || user?.email || 'Loading...'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="p-4 flex items-center justify-center border-b border-border">
          <div className="text-sm font-medium">Investor Portal</div>
        </div>
        <div className="flex overflow-x-auto">
          <Link href="/investor" className="flex-shrink-0">
            <Button variant="ghost" className="rounded-none h-12 text-xs px-4">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/investor/rounds" className="flex-shrink-0 border-l border-border">
            <Button variant="ghost" className="rounded-none h-12 text-xs px-4">
              <CircleDollarSign className="w-4 h-4 mr-2" />
              Rounds
            </Button>
          </Link>
          <Link href="/investor/history" className="flex-shrink-0 border-l border-border">
            <Button variant="ghost" className="rounded-none h-12 text-xs px-4">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          <Link href="/investor/profile" className="flex-shrink-0 border-l border-border">
            <Button variant="ghost" className="rounded-none h-12 text-xs px-4">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
