"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Rocket } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { FeatureRequestMenu } from "../layout/feature-request-menu";
import { sendGAEvent } from "@next/third-parties/google";
import { Tables } from "@/database.types";
import { DashboardSelector } from "../dashboard/dashboard-selector";
import Link from "next/link";
import { LanguageSelector } from "../common/language-selector";
import { useTranslation } from "react-i18next";

interface BaseContainerProps {
  children: ReactNode;
  className?: string;
  viewMode: "board" | "list";
  onToggleViewMode: () => void;
  accountName: string;
  showTryButton?: boolean;
  showSignOutButton?: boolean;
  // Dashboard props
  currentDashboard?: Tables<"dashboard"> | null;
  dashboards?: Tables<"dashboard">[];
  onDashboardSelect?: (dashboard: Tables<"dashboard">) => void;
  onDashboardCreate?: (title: string, description?: string) => Promise<void>;
  dashboardLoading?: boolean;
}

export function BaseContainer({
  children,
  className,
  viewMode,
  onToggleViewMode,
  accountName,
  showTryButton = false,
  showSignOutButton = false,
  currentDashboard,
  dashboards = [],
  onDashboardSelect,
  onDashboardCreate,
  dashboardLoading = false,
}: BaseContainerProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');

  const toSignIn = async () => {
    await signOut(true);
    router.push("/sign-in");
  };

  const toSignUp = async () => {
    sendGAEvent("click_try_sylva");
    router.push("/sign-up");
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="h-10 py-2 px-4 bg-white flex items-center justify-between border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo size={48} />
          </Link>
          {onDashboardSelect && onDashboardCreate && (
            <DashboardSelector
              currentDashboard={currentDashboard || null}
              dashboards={dashboards}
              onDashboardSelect={onDashboardSelect}
              onDashboardCreate={onDashboardCreate}
              loading={dashboardLoading}
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer">
              <div className="text-slate-800 text-m14 polymath">{accountName}</div>
              <ChevronDown className="w-5 text-slate-600" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <Switch id="view-mode" checked={viewMode === "board"} onCheckedChange={onToggleViewMode} />
                <Label htmlFor="view-mode">{t('header.boardView')}</Label>
              </DropdownMenuItem>
              {showTryButton && (
                <DropdownMenuItem onClick={toSignUp} id="try-sylva-button">
                  <Rocket size={16} className="text-slate-600" />
                  {t('common.trySylva')}
                </DropdownMenuItem>
              )}
              <LanguageSelector />
              <FeatureRequestMenu />
              {showSignOutButton && (
                <DropdownMenuItem onClick={toSignIn}>
                  <LogOut size={16} className="text-slate-600" />
                  {t('common.signOut')}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={"flex-grow relative overflow-auto " + className}>{children}</div>
    </div>
  );
}
