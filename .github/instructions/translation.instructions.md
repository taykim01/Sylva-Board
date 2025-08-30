---
applyTo: "**"
---

# Overview

This is an instruction file to guide the implementation of a feature that allows users to change the language of the service. Allow English and Korean.

# Feature Details

- The goal of this feature is to provide multilingual support, enabling users to switch the language of the interface to their preferred language.
- The service should support at least the following languages: English (default), Spanish, French, German, and Japanese.
- The language selection should persist across sessions for logged-in users and default to the browser's language for guests.

## Implementation Requirements

1. **Language Selector**:
    - Add a language selector dropdown to the top-right corner of the interface.
    - The dropdown should display the available languages in their native names (e.g., English, Español, Français, Deutsch, 日本語).

2. **Localization**:
    - Use a localization library such as `i18next` or `react-intl` to manage translations.
    - Store all translations in JSON files, with one file per language (e.g., `en.json`, `es.json`, etc.).
    - Ensure all user-facing text in the application is dynamically loaded based on the selected language.

3. **Persistence**:
    - For logged-in users, save the selected language in the user's profile in the database.
    - For guests, store the selected language in `localStorage` or a cookie.

4. **Default Language**:
    - Detect the user's browser language on their first visit and set it as the default language if it is supported.
    - If the browser language is not supported, default to English.

5. **Dynamic Updates**:
    - Ensure that changing the language updates the interface dynamically without requiring a page reload.

6. **Accessibility**:
    - Ensure the language selector is accessible via keyboard navigation and screen readers.

7. **Testing**:
    - Test the feature thoroughly to ensure all text is translated correctly and the interface behaves as expected in all supported languages.

## Design Considerations

- The language selector should blend seamlessly with the existing design system.
- Use flags or icons sparingly to avoid cluttering the interface. Focus on clear and intuitive design.

## Database Changes

- Add a `language` column to the `settings` table to store the preferred language of logged-in users.

## Example Translation File Structure
