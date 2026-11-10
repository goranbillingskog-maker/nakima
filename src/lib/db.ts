import { supabase, type DatabaseClinic } from "./supabase";
import { type CitySlug, type ServiceSlug } from "./clinics-data";

function normalizeServices(rawServices: any): ServiceSlug[] {
  if (!rawServices) return [];
  let list: string[] = [];
  if (Array.isArray(rawServices)) {
    list = rawServices.flatMap(s => typeof s === "string" ? s.split(/[|,]/) : []);
  } else if (typeof rawServices === "string") {
    list = rawServices.split(/[|,]/);
  }
  const mapped = list.map(s => {
    const clean = s.trim().toLowerCase();
    if (clean.includes("naprapat")) return "naprapat";
    if (clean.includes("kiroprakt")) return "kiropraktor";
    if (clean.includes("massage") || clean.includes("massör")) return "massage";
    if (clean.includes("fysiotera") || clean.includes("sjukgymnast") || clean.includes("fysio")) return "fysioterapeut";
    return null;
  }).filter((s): s is ServiceSlug => s !== null);
  return Array.from(new Set(mapped));
}

function mapClinicFields(clinic: any): DatabaseClinic {
  if (!clinic) return clinic;
  const services = normalizeServices(clinic.services);
  let email = clinic.email || null;
  if (!email && Array.isArray(clinic.practitioners)) {
    const emailItem = clinic.practitioners.find((p: string) => typeof p === "string" && p.startsWith("email:"));
    if (emailItem) email = emailItem.replace("email:", "").trim();
  }
  return {
    ...clinic,
    email,
    services,
    reviewCount: clinic.review_count !== undefined && clinic.review_count !== null ? clinic.review_count : (clinic.reviewCount !== undefined && clinic.reviewCount !== null ? clinic.reviewCount : null),
    ratingSource: clinic.rating_source ?? clinic.ratingSource ?? null,
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
    return (b.rating ?? 0) - (a.rating ?? 0);
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
      return (b.rating ?? 0) - (a.rating ?? 0);
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
  
  const allRows: any[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("clinics")
      .select("slug, region, has_naprapat, has_kiropraktor, has_massage, has_fysioterapeut, last_verified_at")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Error fetching sitemap clinics:", error);
      break;
    }

    if (data && data.length > 0) {
      allRows.push(...data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    } else {
      hasMore = false;
    }
  }

  return (allRows as DatabaseClinic[]).map(mapClinicFields);
}
