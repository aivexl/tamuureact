-- Migration: Add Gift Recipient to Users
ALTER TABLE users ADD COLUMN gift_recipient TEXT;
