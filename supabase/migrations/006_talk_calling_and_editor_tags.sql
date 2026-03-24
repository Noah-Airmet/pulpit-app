-- Add structured metadata fields used by archive/search filters.

ALTER TABLE talks
  ADD COLUMN IF NOT EXISTS calling TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS editor_tags TEXT[] NOT NULL DEFAULT ARRAY['missing footnotes'];

ALTER TABLE talks
  DROP CONSTRAINT IF EXISTS talks_calling_check;

ALTER TABLE talks
  ADD CONSTRAINT talks_calling_check CHECK (
    calling = ANY (ARRAY[
      'none',
      'apostle',
      'president',
      'first presidency',
      'seventy',
      'relief society presidency',
      'young women presidency',
      'presiding bishopric',
      'sunday school presidency',
      'primary presidency',
      'patriarch',
      'bishop',
      'other'
    ])
  );

CREATE INDEX IF NOT EXISTS idx_talks_calling ON talks(calling);
CREATE INDEX IF NOT EXISTS idx_talks_editor_tags ON talks USING GIN(editor_tags);
