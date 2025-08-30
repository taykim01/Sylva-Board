"use client";

import { useEffect } from 'react';
import { useAuth } from './use-auth';
import useLanguageStore, { Language } from '@/core/states/language.store';
import { updateUserLanguage, getSettingsByUserId } from '@/features/settings-features';
import { toast } from 'sonner';

export function useLanguage() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguageStore();

  // Handle language initialization based on authentication status
  useEffect(() => {
    if (user?.id) {
      // Logged in users: load their saved language preference
      const loadUserLanguage = async () => {
        try {
          const { data: settings } = await getSettingsByUserId(user.id);
          if (settings?.language && settings.language !== language) {
            setLanguage(settings.language as Language);
          }
        } catch (error) {
          console.error('Error loading user language:', error);
        }
      };
      loadUserLanguage();
    } else {
      // Not logged in: default to English unless user has manually selected a language
      const hasManualSelection = localStorage.getItem('manual-language-selection');
      if (!hasManualSelection) {
        setLanguage('en');
      }
    }
  }, [user?.id, setLanguage]);

  // Clear manual selection flag when user signs out
  useEffect(() => {
    if (!user?.id) {
      // When user signs out, clear manual selection unless they had one before login
      const hadManualSelectionBeforeLogin = localStorage.getItem('pre-login-manual-selection');
      if (!hadManualSelectionBeforeLogin) {
        localStorage.removeItem('manual-language-selection');
      }
    } else {
      // When user signs in, remember if they had manual selection before
      const hasManualSelection = localStorage.getItem('manual-language-selection');
      if (hasManualSelection) {
        localStorage.setItem('pre-login-manual-selection', 'true');
      }
    }
  }, [user?.id]);

  // Save language preference to database when language changes (for logged-in users)
  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Mark that user has manually selected a language
    localStorage.setItem('manual-language-selection', 'true');
    
    if (user?.id) {
      try {
        const { error } = await updateUserLanguage(user.id, newLanguage);
        if (error) {
          console.error('Error saving language preference:', error);
          toast.error('Failed to save language preference');
        }
      } catch (error) {
        console.error('Error saving language preference:', error);
        toast.error('Failed to save language preference');
      }
    }
  };

  return {
    language,
    setLanguage: handleLanguageChange,
  };
}