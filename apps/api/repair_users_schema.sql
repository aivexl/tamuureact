-- Manual Repair: Add missing gift related columns to users
-- These columns should have been added by migrations 0008 and 0034
ALTER TABLE users ADD COLUMN bank1_name TEXT;
ALTER TABLE users ADD COLUMN bank1_number TEXT;
ALTER TABLE users ADD COLUMN bank1_holder TEXT;
ALTER TABLE users ADD COLUMN bank2_name TEXT;
ALTER TABLE users ADD COLUMN bank2_number TEXT;
ALTER TABLE users ADD COLUMN bank2_holder TEXT;
ALTER TABLE users ADD COLUMN emoney_type TEXT CHECK (emoney_type IN ('dana', 'shopeepay', ''));
ALTER TABLE users ADD COLUMN emoney_number TEXT;
ALTER TABLE users ADD COLUMN gift_address TEXT;
ALTER TABLE users ADD COLUMN gift_recipient TEXT;
