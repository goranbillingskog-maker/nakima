import { createClient } from "@supabase/supabase-js";

// Fetch from environment variables (checking both Vite import.meta and standard process.env for Node compatibility)
const supabaseUrl = (typeof import.meta.env !== "undefined" ? import.meta.env.VITE_SUPABASE_URL : "") || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (typeof import.meta.env !== "undefined" ? import.meta.env.VITE_SUPABASE_ANON_KEY : "") || process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export interface DatabaseClinic {
  slug: string;
  name: string;
  region: string;
  services: string[];
  has_naprapat: boolean;
  has_kiropraktor: boolean;
  has_massage: boolean;
  city: string;
  municipality: string;
  neighborhood: string;
  street: string;
  postal: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  website: string;
  booking_url: string | null;
  booking_platform: string | null;
  rating: number;
  review_count: number;
  price_level: number | null;
  price_first_visit_sek: number | null;
  description: string;
  editors_pick_reason: string | null;
  featured: boolean;
  specialties: string[];
  practitioners: string[];
  opening_hours_summary: string | null;
  hours_mon: string | null;
  hours_tue: string | null;
  hours_wed: string | null;
  hours_thu: string | null;
  hours_fri: string | null;
  hours_sat: string | null;
  hours_sun: string | null;
  established: number | null;
  languages: string[];
  payment_methods: string[];
  accessibility: string[];
  image_url: string | null;
  image_source: string | null;
  image_alt: string | null;
  source_urls: string[];
  last_verified_at: string | null;
}
