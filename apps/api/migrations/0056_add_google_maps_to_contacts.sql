-- Migration: 0056_add_google_maps_to_contacts.sql
-- Description: Add google_maps_url to shop_contacts for store-wide location persistence.
-- Author: Tamuu CTO

ALTER TABLE shop_contacts ADD COLUMN google_maps_url TEXT;
