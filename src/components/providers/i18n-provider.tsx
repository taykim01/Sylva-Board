"use client";

import { ReactNode, useEffect } from 'react';
import '@/lib/i18n';
import useLanguageStore from '@/core/states/language.store';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return <>{children}</>;
}