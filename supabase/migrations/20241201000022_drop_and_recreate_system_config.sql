-- Add additional fields to tbl_system_config to match legacy structure

-- Add all missing fields from the legacy tbl_t000 table
ALTER TABLE tbl_system_config 
ADD COLUMN IF NOT EXISTS fld_langu INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fld_stret VARCHAR(100),
ADD COLUMN IF NOT EXISTS fld_pobox VARCHAR(10),
ADD COLUMN IF NOT EXISTS fld_pstlc VARCHAR(10),
ADD COLUMN IF NOT EXISTS fld_city INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fld_curr INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fld_resta VARCHAR(100),
ADD COLUMN IF NOT EXISTS fld_zweig INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fld_stceg VARCHAR(20) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS fld_telep VARCHAR(15),
ADD COLUMN IF NOT EXISTS fld_telep2 VARCHAR(15),
ADD COLUMN IF NOT EXISTS fld_telep3 VARCHAR(15),
ADD COLUMN IF NOT EXISTS fld_telep4 VARCHAR(15),
ADD COLUMN IF NOT EXISTS fld_e1 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e2 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e3 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e4 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e5 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e6 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e7 VARCHAR(256),
ADD COLUMN IF NOT EXISTS fld_e8 VARCHAR(256);

-- Update existing system config data with additional fields from legacy data
UPDATE tbl_system_config SET
    fld_langu = 0,
    fld_stret = NULL,
    fld_pobox = NULL,
    fld_pstlc = NULL,
    fld_city = 0,
    fld_curr = 0,
    fld_resta = NULL,
    fld_zweig = 0,
    fld_stceg = '1',
    fld_telep = NULL,
    fld_telep2 = NULL,
    fld_telep3 = NULL,
    fld_telep4 = NULL,
    fld_e1 = 'Mit freundlichen Grüßen',
    fld_e2 = 'CleverCoach Nachhilfe Team',
    fld_e3 = 'Tav & Uzun GbR',
    fld_e4 = 'CleverCoach Nachhilfe',
    fld_e5 = 'Höschenhofweg 31',
    fld_e6 = '47249 Duisburg',
    fld_e7 = 'Tel: 0203 39652097',
    fld_e8 = 'E-Mail: Kontakt@clevercoach-nachhilfe.de'
WHERE fld_id = 1;
