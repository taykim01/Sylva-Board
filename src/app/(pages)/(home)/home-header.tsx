"use client";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function HomeHeader() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
      <Logo size={48} />
      {isLoggedIn ? (
        <Link href="/dashboard">
          <Button size="sm" className="text-m14 text-white">
            Dashboard
          </Button>
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="text-m14 text-white">
              Log In
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="sm" className="text-m14">
              Try Demo
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
