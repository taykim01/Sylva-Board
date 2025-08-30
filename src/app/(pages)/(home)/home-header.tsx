"use client";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function HomeHeader() {
  const { isLoggedIn, user } = useAuth();

  console.log({ user });

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
          <Link href="/sign-in">
            <Button variant="outline" size="sm" className="text-m14">
              Log In
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="text-m14">
              Free Board
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
