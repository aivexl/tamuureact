-- Add orbit column to templates and invitations tables
-- This column stores the elements and configuration for the Left and Right stages

ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS orbit JSONB DEFAULT '{"left": {"backgroundColor": "transparent", "isVisible": true, "elements": []}, "right": {"backgroundColor": "transparent", "isVisible": true, "elements": []}}';

ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS orbit JSONB DEFAULT '{"left": {"backgroundColor": "transparent", "isVisible": true, "elements": []}, "right": {"backgroundColor": "transparent", "isVisible": true, "elements": []}}';

COMMENT ON COLUMN templates.orbit IS 'Project Orbit (Cinematic Stage) configuration for Left and Right canvases';
COMMENT ON COLUMN invitations.orbit IS 'Project Orbit (Cinematic Stage) configuration for Left and Right canvases';
