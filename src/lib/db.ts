import { supabase, type DatabaseClinic } from "./supabase";
import { type CitySlug, type ServiceSlug } from "./clinics-data";

function mapClinicFields(clinic: any): DatabaseClinic {
  if (!clinic) return clinic;
  const services = (clinic.services ?? []).map((s: string) => s === "fysioterapi" ? "fysioterapeut" : s);
  return {
    ...clinic,
    services,
    reviewCount: clinic.review_count ?? clinic.reviewCount ?? 0,
    priceLevel: clinic.price_level ?? clinic.priceLevel ?? null,
    bookingUrl: clinic.booking_url ?? clinic.bookingUrl ?? null,
  };
}

export async function fetchClinicsByCity(region: string, service: string): Promise<DatabaseClinic[]> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Database queries skipped.");
    return [];
  }
  let query = supabase.from("clinics").select("*").eq("region", region);

  if (service === "naprapat") {
    query = query.eq("has_naprapat", true);
  } else if (service === "kiropraktor") {
    query = query.eq("has_kiropraktor", true);
  } else if (service === "massage") {
    query = query.eq("has_massage", true);
  } else if (service === "fysioterapeut") {
    query = query.eq("has_fysioterapeut", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching clinics:", error);
    return [];
  }

  // Sort: featured first, then rating descending
  return (data as DatabaseClinic[]).map(mapClinicFields).sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.rating - a.rating;
  });
}

export async function fetchClinicBySlug(region: string, slug: string): Promise<DatabaseClinic | null> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Database queries skipped.");
    return null;
  }
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("region", region)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching clinic ${slug}:`, error);
    return null;
  }

  return mapClinicFields(data as DatabaseClinic | null);
}

export async function fetchRelatedClinics(clinic: DatabaseClinic, limit = 3): Promise<DatabaseClinic[]> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Database queries skipped.");
    return [];
  }
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("region", clinic.region)
    .neq("slug", clinic.slug)
    .limit(20); // fetch a pool to sort in-memory by neighborhood match

  if (error) {
    console.error("Error fetching related clinics:", error);
    return [];
  }

  return (data as DatabaseClinic[])
    .map(mapClinicFields)
    .sort((a, b) => {
      // Prioritize same neighborhood
      const aSame = a.neighborhood === clinic.neighborhood ? 1 : 0;
      const bSame = b.neighborhood === clinic.neighborhood ? 1 : 0;
      if (aSame !== bSame) return bSame - aSame;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

export async function fetchCityClinicCount(region: string, service?: string): Promise<number> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Database queries skipped.");
    return 0;
  }
  let query = supabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("region", region);

  if (service === "naprapat") {
    query = query.eq("has_naprapat", true);
  } else if (service === "kiropraktor") {
    query = query.eq("has_kiropraktor", true);
  } else if (service === "massage") {
    query = query.eq("has_massage", true);
  } else if (service === "fysioterapeut") {
    query = query.eq("has_fysioterapeut", true);
  }

  const { count, error } = await query;
  if (error) {
    console.error(`Error fetching clinic count for ${region}:`, error);
    return 0;
  }

  return count || 0;
}

export async function fetchAllClinicsForSitemap(): Promise<DatabaseClinic[]> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Database queries skipped.");
    return [];
  }
  const { data, error } = await supabase
    .from("clinics")
    .select("slug, region, has_naprapat, has_kiropraktor, has_massage, has_fysioterapeut, last_verified_at");

  if (error) {
    console.error("Error fetching sitemap clinics:", error);
    return [];
  }

  return (data as DatabaseClinic[]).map(mapClinicFields);
}
