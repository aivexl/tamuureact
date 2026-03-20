-- Migration: 0063_global_ad_balance.sql
-- Description: Adds global ad balance to shop_vendors table.

ALTER TABLE shop_vendors ADD COLUMN ad_balance INTEGER DEFAULT 0;
