"use client";

import { useTranslation } from "react-i18next";

interface BaseBottomBarProps {
  onCreateNote: () => Promise<void>;
}

export function BaseBottomBar({ onCreateNote }: BaseBottomBarProps) {
  const { t } = useTranslation('common');

  return (
    <div className="fixed left-6 bottom-6 flex items-center gap-2 z-40">
      <div
        className="polymath rounded-full bg-slate-500 hover:bg-slate-600 transition-all duration-200 text-white h-10 text-m14 w-fit flex items-center gap-1 px-4 cursor-pointer"
        style={{ boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.08)" }}
        onClick={onCreateNote}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4.5 9H13.5M9 13.5V4.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-0.5">{t('notes.addNote')}</div>
      </div>
    </div>
  );
}
