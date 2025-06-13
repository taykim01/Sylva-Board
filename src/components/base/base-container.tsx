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

interface BaseContainerProps {
  children: ReactNode;
  className?: string;
  viewMode: "board" | "list";
  onToggleViewMode: () => void;
  accountName: string;
  showTryButton?: boolean;
  showSignOutButton?: boolean;
}

export function BaseContainer({
  children,
  className,
  viewMode,
  onToggleViewMode,
  accountName,
  showTryButton = false,
  showSignOutButton = false,
}: BaseContainerProps) {
  const { settings, signOut } = useAuth();
  const router = useRouter();

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
        <Logo size={48} />
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
                <Switch id="view-mode" checked={viewMode === settings.view} onCheckedChange={onToggleViewMode} />
                <Label htmlFor="view-mode">Board View</Label>
              </DropdownMenuItem>
              {showTryButton && (
                <DropdownMenuItem onClick={toSignUp} id="try-sylva-button">
                  <Rocket size={16} className="text-slate-600" />
                  Try Sylva!
                </DropdownMenuItem>
              )}
              <FeatureRequestMenu />
              {showSignOutButton && (
                <DropdownMenuItem onClick={toSignIn}>
                  <LogOut size={16} className="text-slate-600" />
                  Sign Out
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
