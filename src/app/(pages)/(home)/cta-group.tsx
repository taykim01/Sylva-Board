"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function CTAGroup() {
  const { t } = useTranslation('common');
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
        <Button size="lg" className="text-m16 px-8 py-3 text-white">
          {isLoggedIn ? t('home.toDashboard') : t('home.getStarted')}
        </Button>
      </Link>
      <Link href="/demo">
        <Button variant="outline" size="lg" className="text-m16 px-8 py-3">
          {t('header.freeBoard')}
        </Button>
      </Link>
    </div>
  );
}
