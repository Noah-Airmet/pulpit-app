-- Unique constraint to support idempotent upserts during bulk ingestion.
-- A talk is uniquely identified by who spoke, when, and at which conference.
ALTER TABLE public.talks
  ADD CONSTRAINT talks_speaker_date_conference_key
  UNIQUE (speaker, talk_date, conference);
