import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta.env !== "undefined" && import.meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseAnonKey =
  (typeof import.meta.env !== "undefined" && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

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
  has_fysioterapeut: boolean;
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
  bookingUrl?: string | null;
  booking_platform: string | null;
  rating: number;
  review_count: number;
  reviewCount?: number;
  price_level: number | null;
  priceLevel?: number | null;
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
