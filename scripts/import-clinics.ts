import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment or .env file.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function run() {
  const csvPath = path.resolve(process.cwd(), "../nakima-alla-kliniker.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    console.error("CSV is empty");
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  const clinics = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) {
      console.warn(`Skipping line ${i + 1} due to mismatch in column count`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    // Parse array and boolean fields
    const formatted: any = {
      slug: row.slug,
      name: row.name,
      region: row.region?.toLowerCase(),
      services: row.services ? row.services.split("|").filter(Boolean) : [],
      has_naprapat: row.has_naprapat === "true",
      has_kiropraktor: row.has_kiropraktor === "true",
      has_massage: row.has_massage === "true",
      city: row.city,
      municipality: row.municipality,
      neighborhood: row.neighborhood,
      street: row.street,
      postal: row.postal,
      address: row.address,
      lat: row.lat ? parseFloat(row.lat) : null,
      lng: row.lng ? parseFloat(row.lng) : null,
      phone: row.phone,
      website: row.website,
      booking_url: row.booking_url || null,
      booking_platform: row.booking_platform || null,
      rating: row.rating ? parseFloat(row.rating) : 0.0,
      review_count: row.review_count ? parseInt(row.review_count, 10) : 0,
      price_level: row.price_level ? parseInt(row.price_level, 10) : null,
      price_first_visit_sek: row.price_first_visit_sek ? parseInt(row.price_first_visit_sek, 10) : null,
      description: row.description,
      editors_pick_reason: row.editors_pick_reason || null,
      featured: row.featured === "true",
      specialties: row.specialties ? row.specialties.split("|").filter(Boolean) : [],
      practitioners: row.practitioners ? row.practitioners.split("|").filter(Boolean) : [],
      opening_hours_summary: row.opening_hours_summary || null,
      hours_mon: row.hours_mon || null,
      hours_tue: row.hours_tue || null,
      hours_wed: row.hours_wed || null,
      hours_thu: row.hours_thu || null,
      hours_fri: row.hours_fri || null,
      hours_sat: row.hours_sat || null,
      hours_sun: row.hours_sun || null,
      established: row.established ? parseInt(row.established, 10) : null,
      languages: row.languages ? row.languages.split("|").filter(Boolean) : [],
      payment_methods: row.payment_methods ? row.payment_methods.split("|").filter(Boolean) : [],
      accessibility: row.accessibility ? row.accessibility.split("|").filter(Boolean) : [],
      image_url: row.image_url || null,
      image_source: row.image_source || null,
      image_alt: row.image_alt || null,
      source_urls: row.source_urls ? row.source_urls.split("|").filter(Boolean) : [],
      last_verified_at: row.last_verified_at || null
    };

    clinics.push(formatted);
  }

  console.log(`Parsed ${clinics.length} clinics. Importing to Supabase...`);

  // Batch insert/upsert
  const { data, error } = await supabase
    .from("clinics")
    .upsert(clinics, { onConflict: "slug" });

  if (error) {
    console.error("Error importing clinics:", error);
    process.exit(1);
  }

  console.log("Successfully imported all clinics!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
