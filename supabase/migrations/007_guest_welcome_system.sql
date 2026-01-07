-- Migration 007: Guest Welcome System Structure

-- 1. Add 'type' column to 'templates' table
-- Check if column exists first to avoid errors (pseudo-code logic, but SQL direct alteration is typically fine if tracked)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'invitation' CHECK (type IN ('invitation', 'display'));

-- 2. Create 'user_display_designs' table for Reusable User Displays
CREATE TABLE IF NOT EXISTS user_display_designs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL DEFAULT 'Untitled Display',
    content jsonb DEFAULT '[]'::jsonb, -- Stores the Landscape Design
    thumbnail_url text, -- For dashboard preview
    source_template_id uuid REFERENCES templates(id) ON DELETE SET NULL, -- Optional: Track which master template was used
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on 'user_display_designs'
ALTER TABLE user_display_designs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_display_designs
CREATE POLICY "Users can view their own display designs" 
ON user_display_designs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own display designs" 
ON user_display_designs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own display designs" 
ON user_display_designs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own display designs" 
ON user_display_designs FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Link Invitations to a Display Design
-- This allows an invitation to 'select' which Welcome Screen design to use
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS display_design_id uuid REFERENCES user_display_designs(id) ON DELETE SET NULL;

-- 6. Add welcome_content to invitations (Legacy/Alternative Approach)
-- We decided to use 'user_display_designs' table for reusability, so we might NOT need this column.
-- However, per the "Hybrid" plan discussions, keeping a direct column was discussed.
-- BUT the Final Plan said "Table `user_display_instances` (here named `user_display_designs`)".
-- So we strictly use the FK approach. 'display_design_id' is sufficient.
-- If we need a 'quick custom' mode without creating a full design library item, we could use a column, 
-- but sticking to the Library Model is cleaner. We will SKIP adding a json column to invitations.

-- End of Migration 007
