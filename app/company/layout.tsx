'use client';

import { Building2, LayoutDashboard, Users, CircleDollarSign, Home, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

export default function CompanyLayout({
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
            <Link href="/company">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname === '/company' 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/company/rounds">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/company/rounds') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <CircleDollarSign className="w-5 h-5 mr-3" />
                Rounds
              </Button>
            </Link>
            <Link href="/company/investors">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/company/investors') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Investors
              </Button>
            </Link>
            <Link href="/company/audit">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname?.startsWith('/company/audit') 
                    ? 'text-foreground bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Audit Logs
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex-shrink-0">
          <Separator />
          <div className="p-6 space-y-3">
            {user ? (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Signed in as</div>
                <div className="text-sm font-medium truncate">{user.email}</div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Company Portal</div>
                <div className="text-sm font-medium">Not signed in</div>
              </div>
            )}
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
          <div className="text-sm font-medium">Company Portal</div>
        </div>
        <div className="flex overflow-x-auto">
          <Link href="/company" className="flex-1 min-w-[90px]">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs px-2">
              <LayoutDashboard className="w-4 h-4 mr-1" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Home</span>
            </Button>
          </Link>
          <Link href="/company/rounds" className="flex-1 min-w-[90px] border-l border-border">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs px-2">
              <CircleDollarSign className="w-4 h-4 mr-1" />
              Rounds
            </Button>
          </Link>
          <Link href="/company/investors" className="flex-1 min-w-[90px] border-l border-border">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs px-2">
              <Users className="w-4 h-4 mr-1" />
              Investors
            </Button>
          </Link>
          <Link href="/company/audit" className="flex-1 min-w-[90px] border-l border-border">
            <Button variant="ghost" className="w-full rounded-none h-12 text-xs px-2">
              <FileText className="w-4 h-4 mr-1" />
              Audit
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
