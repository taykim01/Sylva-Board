"use client";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSelector } from "@/components/common/language-selector";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function HomeHeader() {
  const { t } = useTranslation('common');
  const { isLoggedIn } = useAuth();

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
      <Logo size={48} />
      <div className="flex items-center gap-4">
        <LanguageSelector />
        {isLoggedIn ? (
          <Link href="/dashboard">
            <Button size="sm" className="text-m14 text-white">
              {t('header.dashboard')}
            </Button>
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="text-m14">
                {t('header.login')}
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="ghost" size="sm" className="text-m14">
                {t('header.freeBoard')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
