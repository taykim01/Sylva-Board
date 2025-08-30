"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

/**
 * A safe translation hook that prevents hydration mismatches
 * by ensuring server and client render the same content initially
 */
export function useSafeTranslation(namespace: string = 'common') {
  const { t, i18n } = useTranslation(namespace);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  /**
   * Safe translation function that returns fallback during SSR/hydration
   * and actual translation after hydration
   */
  const safeT = (key: string, fallback?: string): string => {
    if (!isHydrated) {
      // During SSR and initial hydration, use fallback or English translation
      return fallback || getEnglishTranslation(key);
    }
    return t(key);
  };

  return { t: safeT, i18n, isHydrated };
}

// Helper to get English translations for fallbacks
function getEnglishTranslation(key: string): string {
  const translations: Record<string, string> = {
    // Header translations
    'header.dashboard': 'Dashboard',
    'header.login': 'Log In',
    'header.freeBoard': 'Free Board',
    'header.logOut': 'Log Out',
    'header.boardView': 'Board View',
    'header.installApp': 'Install App',
    'header.language': 'Language',
    
    // Dashboard translations
    'dashboard.selectDashboard': 'Select Dashboard',
    'dashboard.createDashboard': 'Create Dashboard',
    'dashboard.createNew': 'Create New',
    'dashboard.title': 'Title',
    'dashboard.description': 'Description',
    'dashboard.create': 'Create',
    'dashboard.cancel': 'Cancel',
    'dashboard.untitledDashboard': 'Untitled Dashboard',
    'dashboard.reassignNote': 'Reassign Note',
    'dashboard.enterTitle': 'Enter dashboard title',
    'dashboard.descriptionOptional': 'Description (Optional)',
    'dashboard.enterDescription': 'Enter dashboard description',
    'dashboard.creating': 'Creating...',
    
    // Language translations
    'languages.en': 'English',
    'languages.ko': '한국어',
    
    // Auth translations
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signUpHere': 'Sign up here',
    'auth.signInHere': 'Sign in here',
    'auth.welcomeBack': 'Welcome Back',
    'auth.welcomeToSylva': 'Welcome to Sylva',
    'auth.createBoardSubtitle': 'Create your personal board to get started',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.confirmPassword': 'Confirm your password',
    'auth.confirmPasswordLabel': 'Confirm Password',
    
    // Demo translations
    'demo.startDemo': 'Start Demo',
    'demo.welcomeToDemo': 'Welcome to Demo',
    'demo.tryFeatures': 'Try out the features',
    'demo.demoDescription': 'You can start a demo session without signing up.',
    'demo.start': 'Start',
    'demo.demoAccount': 'Demo Account',
    
    // Notes translations
    'notes.untitledNote': 'Untitled Note',
    'notes.newNote': 'New Note',
    'notes.addNote': 'Add Note',
    'notes.typeHere': 'Type here...',
    'notes.searchNotes': 'Search notes...',
    'notes.untitled': 'Untitled',
    'notes.deleteConfirmTitle': 'Are you sure you want to delete?',
    'notes.deleteConfirmDescription': 'This action cannot be undone. The note will be permanently deleted.',
    'notes.createdAt': 'Created at',
    'notes.color': 'Color',
    'notes.moveToDashboard': 'Move to Dashboard',
    'notes.changeColor': 'Change Color',
    
    // AI translations
    'ai.askAI': 'Ask AI',
    'ai.typeMessage': 'Type a message...',
    'ai.send': 'Send',
    'ai.thinking': 'Thinking...',
    'ai.error': 'An error occurred. Please try again.',
    'ai.you': 'You',
    'ai.aiAssistant': 'AI Assistant',
    'ai.placeholder': 'Type a message...',
    'ai.clear': 'Clear',
    'ai.closeChat': 'Close Chat',
    'ai.sourcesFromNotes': 'Sources from notes:',
    
    // Common translations
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.trySylva': 'Try Sylva!',
    'common.signOut': 'Sign Out',
    'common.requestFeature': 'Request Feature',
    'common.requestFeatureTitle': 'Request Feature',
    'common.requestFeatureDescription': 'Thank you for your feedback!\nWe will review your request and get back to you as soon as possible.',
    'common.requestFeaturePlaceholder': 'Please describe the feature you would like to request',
    'common.sendRequest': 'Send Request',
    'common.dismiss': 'Dismiss',
    
    // Home translations
    'home.title': 'Your Digital Board',
    'home.subtitle': 'A modern, lightweight alternative to Notion. Create, organize, and collaborate on boards with rich text editing, task management, and real-time features - perfect for students who need a simple yet powerful workspace.',
    'home.getStarted': 'Get Started',
    'home.toDashboard': 'To Dashboard',
    'home.tryWithoutAccount': 'Want to try Sylva without an account?',
    'home.features.richTextTitle': '🎨 Rich Text Editing',
    'home.features.richTextDesc': 'Powerful TipTap editor with formatting, tables, and image support',
    'home.features.collaborationTitle': '🔄 Seamless Collaboration',
    'home.features.collaborationDesc': 'Work together with real-time updates and synchronization',
    'home.features.taskManagementTitle': '🎯 Task Management',
    'home.features.taskManagementDesc': 'Stay organized with built-in task tracking and board management',
  };
  
  return translations[key] || key;
}