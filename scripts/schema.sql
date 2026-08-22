-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  slug text PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL, -- e.g., 'stockholm', 'goteborg', 'malmo'
  services text[] NOT NULL DEFAULT '{}',
  has_naprapat boolean NOT NULL DEFAULT false,
  has_kiropraktor boolean NOT NULL DEFAULT false,
  has_massage boolean NOT NULL DEFAULT false,
  has_fysioterapeut boolean NOT NULL DEFAULT false,
  city text,
  municipality text,
  neighborhood text,
  street text,
  postal text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  website text,
  booking_url text,
  booking_platform text,
  rating numeric(3,2) DEFAULT 0.0,
  review_count integer DEFAULT 0,
  price_level integer,
  price_first_visit_sek integer,
  description text,
  editors_pick_reason text,
  featured boolean NOT NULL DEFAULT false,
  specialties text[] NOT NULL DEFAULT '{}',
  practitioners text[] NOT NULL DEFAULT '{}',
  opening_hours_summary text,
  hours_mon text,
  hours_tue text,
  hours_wed text,
  hours_thu text,
  hours_fri text,
  hours_sat text,
  hours_sun text,
  established integer,
  languages text[] NOT NULL DEFAULT '{}',
  payment_methods text[] NOT NULL DEFAULT '{}',
  accessibility text[] NOT NULL DEFAULT '{}',
  image_url text,
  image_source text,
  image_alt text,
  source_urls text[] NOT NULL DEFAULT '{}',
  last_verified_at date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinics_region ON clinics(region);
CREATE INDEX IF NOT EXISTS idx_clinics_has_naprapat ON clinics(has_naprapat) WHERE has_naprapat = true;
CREATE INDEX IF NOT EXISTS idx_clinics_has_kiropraktor ON clinics(has_kiropraktor) WHERE has_kiropraktor = true;
CREATE INDEX IF NOT EXISTS idx_clinics_has_massage ON clinics(has_massage) WHERE has_massage = true;
CREATE INDEX IF NOT EXISTS idx_clinics_has_fysioterapeut ON clinics(has_fysioterapeut) WHERE has_fysioterapeut = true;
CREATE INDEX IF NOT EXISTS idx_clinics_featured ON clinics(featured) WHERE featured = true;

-- Enable Row Level Security (RLS)
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Allow read-only access to everyone
CREATE POLICY "Allow public read access" ON clinics
  FOR SELECT USING (true);
