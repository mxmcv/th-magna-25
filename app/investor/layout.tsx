import { User, LayoutDashboard, CircleDollarSign, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Magna</span>
          </Link>

          <nav className="space-y-1">
            <Link href="/investor">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/investor/rounds">
              <Button variant="ghost" className="w-full justify-start">
                <CircleDollarSign className="w-4 h-4 mr-3" />
                Available Rounds
              </Button>
            </Link>
            <Link href="/investor/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="w-4 h-4 mr-3" />
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
