-- Drop and recreate tbl_urls to match legacy structure exactly
-- This migration recreates tbl_urls with the exact structure from the legacy database

-- 1. Drop existing tbl_urls table and all its constraints
DROP TABLE IF EXISTS public.tbl_urls CASCADE;

-- 2. Create tbl_urls with legacy structure
CREATE TABLE public.tbl_urls (
    fld_id INTEGER NOT NULL,
    fld_itype VARCHAR(15) NOT NULL,
    fld_url TEXT NOT NULL,
    fld_edate DATE NOT NULL,
    fld_cname TEXT NOT NULL,
    fld_invno INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add primary key
ALTER TABLE public.tbl_urls 
ADD CONSTRAINT tbl_urls_pkey PRIMARY KEY (fld_id);

-- 4. Add sequence for auto-increment (if needed)
-- Note: Legacy uses manual ID assignment, but we'll add sequence for new records
CREATE SEQUENCE IF NOT EXISTS public.tbl_urls_fld_id_seq;
ALTER TABLE public.tbl_urls 
ALTER COLUMN fld_id SET DEFAULT nextval('public.tbl_urls_fld_id_seq');
ALTER SEQUENCE public.tbl_urls_fld_id_seq OWNED BY public.tbl_urls.fld_id;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tbl_urls_itype ON public.tbl_urls(fld_itype);
CREATE INDEX IF NOT EXISTS idx_tbl_urls_edate ON public.tbl_urls(fld_edate);
CREATE INDEX IF NOT EXISTS idx_tbl_urls_invno ON public.tbl_urls(fld_invno);

-- 7. Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tbl_urls_updated_at 
    BEFORE UPDATE ON public.tbl_urls 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
