"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/hooks/use-auth";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useDashboard } from "@/hooks/use-dashboard";
import { FeatureRequestMenu } from "./feature-request-menu";
import { LanguageSelector } from "@/components/common/language-selector";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation('common');
  const { signOut, user } = useAuth();
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const { toggleViewMode, viewMode } = useDashboard();

  return (
    <div className="h-10 py-2 px-4 bg-white flex items-center justify-between border-b border-slate-200 sticky top-0 z-10">
      <Logo size={48} />
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer">
            <div className="text-slate-800 text-m14 polymath">{user?.email}</div>
            <ChevronDown className="w-5 text-slate-600" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <Switch id="view-mode" checked={viewMode === "board"} onCheckedChange={toggleViewMode} />
              <Label htmlFor="view-mode">{t('header.boardView')}</Label>
            </DropdownMenuItem>
            {isInstallable && (
              <DropdownMenuItem onClick={handleInstallClick}>
                <Download size={16} />
                {t('header.installApp')}
              </DropdownMenuItem>
            )}
            <FeatureRequestMenu />
            <DropdownMenuItem onClick={() => signOut()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.80002 1.125C4.53768 1.125 4.32502 1.33766 4.32502 1.6C4.32502 1.86234 4.53768 2.075 4.80002 2.075H12.8C12.8322 2.075 12.8583 2.10112 12.8583 2.13333V13.8667C12.8583 13.8989 12.8322 13.925 12.8 13.925H4.80002C4.53768 13.925 4.32502 14.1377 4.32502 14.4C4.32502 14.6623 4.53768 14.875 4.80002 14.875H12.8C13.3569 14.875 13.8083 14.4236 13.8083 13.8667V2.13333C13.8083 1.57645 13.3569 1.125 12.8 1.125H4.80002ZM7.00256 5.26412C6.81706 5.07863 6.51631 5.07863 6.33081 5.26412C6.14531 5.44962 6.14531 5.75038 6.33081 5.93588L7.91993 7.525H0.53335C0.271014 7.525 0.0583496 7.73766 0.0583496 8C0.0583496 8.26233 0.271014 8.475 0.53335 8.475H7.91993L6.33081 10.0641C6.14531 10.2496 6.14531 10.5504 6.33081 10.7359C6.51631 10.9214 6.81706 10.9214 7.00256 10.7359L9.40256 8.33588C9.58806 8.15038 9.58806 7.84962 9.40256 7.66412L7.00256 5.26412Z"
                  fill="#384151"
                />
              </svg>
              {t('header.logOut')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
