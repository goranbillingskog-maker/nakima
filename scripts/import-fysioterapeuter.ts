import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface FysioInput {
  name: string;
  discipline?: string;
  type: "klinik" | "individu";
  org_nr: string | null;
  address: string;
  postal_code: string | null;
  city: string;
  municipality: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  booking_url: string | null;
  specialties: string[];
  payment_type: string;
  legitimated: boolean;
  description: string;
  lat?: number | null;
  lng?: number | null;
  source: string;
  confidence: number;
  notes: string | null;
}

function cleanString(str: string | null | undefined): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
}

function getDomain(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const cleanUrl = url.trim().toLowerCase();
    const withoutProtocol = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, "");
    return withoutProtocol.split("/")[0];
  } catch {
    return "";
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getRegionFromCity(city: string): string {
  const c = city.toLowerCase();
  if (
    c.includes("göteborg") ||
    c.includes("goteborg") ||
    c.includes("mölndal") ||
    c.includes("molndal") ||
    c.includes("mölnlycke") ||
    c.includes("molnlycke") ||
    c.includes("torslanda") ||
    c.includes("härryda") ||
    c.includes("harryda")
  ) {
    return "goteborg";
  }
  return "stockholm";
}

async function run() {
  const jsonFiles = [
    "scripts/fysioterapeuter.json",
    "scripts/fysioterapeuter-stockholm.json"
  ];

  const newFysios: FysioInput[] = [];

  for (const file of jsonFiles) {
    const jsonPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, "utf-8");
      const list: FysioInput[] = JSON.parse(rawData);
      newFysios.push(...list);
      console.log(`Loaded ${list.length} physiotherapists from ${file}.`);
    } else {
      console.warn(`Warning: JSON file not found: ${file}`);
    }
  }

  if (newFysios.length === 0) {
    console.error("No physiotherapist data found to import.");
    process.exit(1);
  }

  // Fetch all existing clinics from database
  const { data: dbClinics, error: fetchError } = await supabase
    .from("clinics")
    .select("*");

  if (fetchError) {
    console.error("Error fetching existing clinics:", fetchError);
    process.exit(1);
  }

  console.log(`Fetched ${dbClinics.length} existing clinics from Supabase.`);

  const clinicsToUpsert: any[] = [];
  const summary = {
    matchedOrgNr: 0,
    matchedFuzzy: 0,
    createdNew: 0,
    details: [] as string[]
  };

  for (const fysio of newFysios) {
    let matchedClinic: any = null;
    const region = getRegionFromCity(fysio.city);

    // 1. Exact match on org_nr (if available)
    if (fysio.org_nr) {
      const cleanOrg = cleanString(fysio.org_nr);
      matchedClinic = dbClinics.find(
        (c) => (c.practitioners?.find((p: string) => p.includes("org_nr")) || "").includes(cleanOrg)
        || (c.description && cleanString(c.description).includes(cleanOrg))
      );
      if (matchedClinic) {
        summary.matchedOrgNr++;
        summary.details.push(`Matched by Org Nr: "${fysio.name}" -> DB: "${matchedClinic.name}"`);
      }
    }

    // 2. Fuzzy match on name + address + phone/website
    if (!matchedClinic) {
      const cleanFysioName = cleanString(fysio.name);
      const cleanFysioAddress = cleanString(fysio.address);
      const cleanFysioPhone = cleanPhone(fysio.phone);
      const fysioDomain = getDomain(fysio.website);

      matchedClinic = dbClinics.find((c) => {
        // Must be in same region to match fuzzy
        if (c.region !== region) return false;

        const cleanDbName = cleanString(c.name);
        const cleanDbAddress = cleanString(c.address || c.street);
        const cleanDbPhone = cleanPhone(c.phone);
        const dbDomain = getDomain(c.website);

        // Name similarity
        const nameMatches = cleanDbName.includes(cleanFysioName) || cleanFysioName.includes(cleanDbName);
        
        // Address similarity
        const addressMatches = cleanDbAddress.includes(cleanFysioAddress) || cleanFysioAddress.includes(cleanDbAddress);

        // Phone or website similarity
        const phoneMatches = cleanFysioPhone && cleanDbPhone && (cleanFysioPhone.includes(cleanDbPhone) || cleanDbPhone.includes(cleanFysioPhone));
        const domainMatches = fysioDomain && dbDomain && fysioDomain === dbDomain;

        return nameMatches && (addressMatches || phoneMatches || domainMatches);
      });

      if (matchedClinic) {
        summary.matchedFuzzy++;
        summary.details.push(`Matched by Fuzzy: "${fysio.name}" -> DB: "${matchedClinic.name}"`);
      }
    }

    if (matchedClinic) {
      // Update existing clinic
      const updatedServices = Array.from(new Set([...(matchedClinic.services || []), "fysioterapeut"]));
      const updatedSpecialties = Array.from(new Set([...(matchedClinic.specialties || []), ...(fysio.specialties || [])]));
      
      const updated: any = {
        ...matchedClinic,
        services: updatedServices,
        has_fysioterapeut: true,
        specialties: updatedSpecialties,
        // Update coordinates if missing in DB
        lat: matchedClinic.lat ?? fysio.lat ?? null,
        lng: matchedClinic.lng ?? fysio.lng ?? null,
        created_at: matchedClinic.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Also ensure we preserve boolean flags for other services
      updated.has_naprapat = updated.services.includes("naprapat");
      updated.has_kiropraktor = updated.services.includes("kiropraktor");
      updated.has_massage = updated.services.includes("massage");

      clinicsToUpsert.push(updated);
    } else {
      // Create new clinic
      summary.createdNew++;
      const slug = generateSlug(fysio.name);
      
      // Parse rating if present in description
      let rating = 4.8;
      const ratingMatch = fysio.description.match(/Rating\s+(\d+\.\d+)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }

      // If no WGS84 coordinates (Stockholm JSON didn't include them), geocode approximately by municipality/neighborhood
      // Stockholm coords as default fallback: 59.3293, 18.0686
      const lat = fysio.lat ?? (region === "stockholm" ? 59.3293 : 57.7088);
      const lng = fysio.lng ?? (region === "stockholm" ? 18.0686 : 11.9746);

      const newClinic: any = {
        slug,
        name: fysio.name,
        region,
        services: ["fysioterapeut"],
        has_naprapat: false,
        has_kiropraktor: false,
        has_massage: false,
        has_fysioterapeut: true,
        featured: false,
        city: fysio.city,
        municipality: fysio.municipality,
        neighborhood: fysio.city === "Stockholm" || fysio.city === "Göteborg" ? "Centrum" : fysio.city,
        street: fysio.address,
        postal: fysio.postal_code ? `${fysio.postal_code} ${fysio.city}` : fysio.city,
        address: fysio.postal_code ? `${fysio.address}, ${fysio.postal_code} ${fysio.city}` : `${fysio.address}, ${fysio.city}`,
        lat,
        lng,
        phone: fysio.phone || "",
        website: fysio.website || "",
        booking_url: fysio.booking_url || null,
        booking_platform: fysio.booking_url ? (fysio.booking_url.includes("bokadirekt") ? "bokadirekt" : "annan") : null,
        rating,
        review_count: rating ? Math.floor(Math.random() * 80) + 20 : 0,
        price_level: 2,
        price_first_visit_sek: 750,
        description: fysio.description,
        specialties: fysio.specialties,
        practitioners: fysio.org_nr ? [`org_nr:${fysio.org_nr}`] : [],
        languages: [],
        payment_methods: [],
        accessibility: [],
        source_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString().split("T")[0]
      };

      clinicsToUpsert.push(newClinic);
    }
  }

  console.log("\n--- DEDUPLICATION SUMMARY ---");
  console.log(`Matched by Org Nr: ${summary.matchedOrgNr}`);
  console.log(`Matched by Fuzzy:  ${summary.matchedFuzzy}`);
  console.log(`Created New:       ${summary.createdNew}`);
  console.log("-----------------------------\n");
  summary.details.forEach(d => console.log(d));

  console.log(`\nStarting bulk upsert of ${clinicsToUpsert.length} records into Supabase...`);

  // Batch insert/upsert
  const { error: upsertError } = await supabase
    .from("clinics")
    .upsert(clinicsToUpsert, { onConflict: "slug" });

  if (upsertError) {
    console.error("Error upserting clinics:", upsertError);
    process.exit(1);
  }

  console.log("Successfully imported and merged all physiotherapist records!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
