-- Add language column to settings table for user language preferences
ALTER TABLE settings ADD COLUMN language VARCHAR(5) DEFAULT 'en';

-- Add a check constraint to ensure only supported languages are stored
ALTER TABLE settings ADD CONSTRAINT settings_language_check 
  CHECK (language IN ('en', 'ko'));

-- Create an index on the language column for better query performance
CREATE INDEX idx_settings_language ON settings(language);