"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import { useTranslation } from "react-i18next";
import HomeHeader from "./home-header";
import CTAGroup from "./cta-group";

export default function Page() {
  const { t } = useTranslation('common');
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeHeader />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Logo size={96} />
            </div>

            <div className="space-y-4">
              <h1 className="text-b32 font-bold tracking-tight">
                {t('home.title')}
              </h1>
              <p className="text-m18 text-muted-foreground max-w-2xl mx-auto">
                {t('home.subtitle')}
              </p>
            </div>

            <CTAGroup />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">{t('home.features.richTextTitle')}</CardTitle>
                <CardDescription>{t('home.features.richTextDesc')}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">{t('home.features.collaborationTitle')}</CardTitle>
                <CardDescription>{t('home.features.collaborationDesc')}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">{t('home.features.taskManagementTitle')}</CardTitle>
                <CardDescription>{t('home.features.taskManagementDesc')}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center pt-8">
            <p className="text-r14 text-muted-foreground">
              {t('home.tryWithoutAccount')}{" "}
              <Link href="/demo" className="text-primary hover:underline">
                {t('header.freeBoard')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
