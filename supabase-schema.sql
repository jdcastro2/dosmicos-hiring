-- =====================================================
-- Dosmicos Hiring - Supabase Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create the table
-- Go to: https://app.supabase.com/project/_/sql

-- Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Step 1: Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    university TEXT NOT NULL,
    portfolio_link TEXT,

    -- Step 2: Diagnostic Questions
    diagnostic_whats_working TEXT NOT NULL,
    diagnostic_improvements TEXT NOT NULL,
    diagnostic_missed_opportunity TEXT NOT NULL,

    -- Step 3: Campaign Concept
    campaign_name TEXT NOT NULL,
    campaign_concept TEXT NOT NULL,
    campaign_executions TEXT NOT NULL,

    -- Step 4: Budget Challenge
    budget_challenge TEXT NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow inserts from anonymous users (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON applications
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy to allow authenticated users to read all applications
-- (for your admin dashboard later)
CREATE POLICY "Allow authenticated reads" ON applications
    FOR SELECT
    TO authenticated
    USING (true);

-- Optional: Create a view for easy access to recent applications
CREATE OR REPLACE VIEW recent_applications AS
SELECT
    id,
    created_at,
    full_name,
    email,
    phone,
    university,
    portfolio_link,
    LEFT(diagnostic_whats_working, 100) || '...' AS diagnostic_preview,
    campaign_name,
    LEFT(budget_challenge, 100) || '...' AS challenge_preview
FROM applications
ORDER BY created_at DESC
LIMIT 50;

-- Grant access to the view
GRANT SELECT ON recent_applications TO authenticated;

-- =====================================================
-- Done! Your table is ready to receive applications.
-- =====================================================
