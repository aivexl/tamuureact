-- Description: Adds status column to templates table to support draft/publish flow.
-- Migration: 0069_add_status_to_templates.sql

ALTER TABLE templates ADD COLUMN status TEXT DEFAULT 'published';
-- Existing templates are published by default to maintain current behavior
