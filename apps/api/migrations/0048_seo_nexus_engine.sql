-- Migration: 0048_seo_nexus_engine.sql
-- Description: Infrastruktur untuk Programmatic SEO (Intent-Based & Time-Sensitive)
-- Author: Tamuu CTO

-- 1. Tabel Master Template (Bahan Baku SEO)
CREATE TABLE IF NOT EXISTS seo_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    intent_type TEXT NOT NULL, -- 'DEFAULT', 'CHEAP', 'BEST', 'PROMO', 'PRO', 'ESTETIK', etc.
    section TEXT NOT NULL, -- 'TITLE', 'META_DESC', 'H1', 'INTRO_BODY'
    content_template TEXT NOT NULL, -- Berisi placeholder: {Category}, {City}, {Month}, {Year}, {MinPrice}, {Count}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Metadata Wilayah (Penyimpan Data Unik Kota)
CREATE TABLE IF NOT EXISTS seo_city_metadata (
    city_name TEXT PRIMARY KEY,
    province TEXT,
    local_fact TEXT, -- Fakta unik kota (misal: "Kota Udang" untuk Cirebon)
    is_active INTEGER DEFAULT 1
);

-- 3. Tabel SEO Permutation Cache (Untuk 0ms Latency)
CREATE TABLE IF NOT EXISTS seo_permutation_cache (
    id TEXT PRIMARY KEY, -- Hash dari Category + City + Intent + Month + Year
    slug_path TEXT UNIQUE NOT NULL, -- /shop/mua/cirebon/promo-agustus-2026
    generated_title TEXT,
    generated_description TEXT,
    generated_h1 TEXT,
    generated_body_content TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_intent ON seo_templates(intent_type);
CREATE INDEX IF NOT EXISTS idx_seo_cache_path ON seo_permutation_cache(slug_path);
