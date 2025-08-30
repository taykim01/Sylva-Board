"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useSafeTranslation } from "@/hooks/use-safe-translation";
import { useLanguage } from "@/hooks/use-language";
import { Language } from "@/core/states/language.store";

export function LanguageSelector() {
  const { t } = useSafeTranslation('common');
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: t('languages.en') },
    { code: 'ko', name: t('languages.ko') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-100">
          <Languages className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-700">
            {languages.find(lang => lang.code === language)?.name}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {languages.map(({ code, name }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={language === code ? "bg-slate-100" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}