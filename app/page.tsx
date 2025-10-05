import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/company">
          <Button size="lg" className="w-full sm:w-auto">
            Company Portal
          </Button>
        </Link>
        <Link href="/investor">
          <Button size="lg" className="w-full sm:w-auto">
            Investor Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}