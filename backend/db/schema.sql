-- db/schema.sql

-- First, ensure the PostGIS extension is enabled.
-- This is idempotent and safe to run multiple times.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Now, create the table and index.
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  -- For now, we'll use a simple text field for user_id
  user_id TEXT NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  -- This is the special geospatial column!
  -- It stores points using the standard WGS 84 coordinate system (SRID 4326)
  location GEOGRAPHY(Point, 4326) NOT NULL 
);

-- Create a geospatial index for super-fast location-based queries
CREATE INDEX IF NOT EXISTS posts_location_idx ON posts USING GIST (location);