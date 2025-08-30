import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/lib/i18n";

export type Language = 'en' | 'ko';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  initializeLanguage: () => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      
      setLanguage: (language: Language) => {
        set({ language });
        i18n.changeLanguage(language);
        localStorage.setItem('i18nextLng', language);
      },
      
      initializeLanguage: () => {
        const storedLanguage = localStorage.getItem('i18nextLng') as Language;
        const hasManualSelection = localStorage.getItem('manual-language-selection');
        
        // If user has manually selected a language, use stored language
        // Otherwise, default to English for non-logged-in users
        const preferredLanguage = hasManualSelection && storedLanguage 
          ? storedLanguage 
          : storedLanguage || 'en';
        
        get().setLanguage(preferredLanguage);
      },
    }),
    {
      name: "language-store",
    },
  ),
);

export default useLanguageStore;