import { DATASET_UPDATED_AT, cities } from "./clinics-data";
import { fetchAllClinicsForSitemap } from "./db";

export interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

export const SITEMAP_BASE_URL = "https://nakima.se";

const articleMetadata = [
  { slug: "darfor-far-vi-nacksmarta-av-kontorsarbete", datePublished: "2026-08-13" },
  { slug: "ryggskott-nar-ska-man-soka-hjalp", datePublished: "2026-08-13" },
  { slug: "vad-kostar-en-naprapat-2026", datePublished: "2026-08-13" },
];

export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const datasetLastmod = DATASET_UPDATED_AT;
  const entries: SitemapEntry[] = [
    { path: "/", lastmod: datasetLastmod, changefreq: "weekly", priority: "1.0" },
    { path: "/magasin", lastmod: "2026-08-13", changefreq: "weekly", priority: "0.8" },
    { path: "/ansvarsfriskrivning", lastmod: "2026-08-13", changefreq: "monthly", priority: "0.4" },
    { path: "/integritetspolicy", lastmod: "2026-08-13", changefreq: "monthly", priority: "0.4" },
  ];

  // Add magazine articles
  for (const article of articleMetadata) {
    entries.push({
      path: `/magasin/${article.slug}`,
      lastmod: article.datePublished,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  // Try to load clinics from Supabase
  let dbClinics = [];
  try {
    dbClinics = await fetchAllClinicsForSitemap();
  } catch (e) {
    console.error("Failed to fetch clinics for sitemap, generating default pages only:", e);
  }

  const services = ["naprapat", "kiropraktor", "massage"] as const;

  for (const service of services) {
    for (const city of cities) {
      // Check if there are clinics for this service in this city
      const hasServiceInCity = dbClinics.some(
        (c) =>
          c.region === city.slug &&
          ((service === "naprapat" && c.has_naprapat) ||
            (service === "kiropraktor" && c.has_kiropraktor) ||
            (service === "massage" && c.has_massage))
      );

      if (!hasServiceInCity) continue;

      const cityClinics = dbClinics.filter(
        (c) =>
          c.region === city.slug &&
          ((service === "naprapat" && c.has_naprapat) ||
            (service === "kiropraktor" && c.has_kiropraktor) ||
            (service === "massage" && c.has_massage))
      );

      const cityLastmod =
        cityClinics
          .map((c) => c.last_verified_at ?? datasetLastmod)
          .sort()
          .at(-1) ?? datasetLastmod;

      entries.push({
        path: `/${service}/${city.slug}`,
        lastmod: cityLastmod,
        changefreq: "weekly",
        priority: "0.9",
      });

      for (const clinic of cityClinics) {
        entries.push({
          path: `/${service}/${city.slug}/${clinic.slug}`,
          lastmod: clinic.last_verified_at ?? datasetLastmod,
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    }
  }

  return entries;
}

export async function renderSitemapXml(): Promise<string> {
  const entries = await buildSitemapEntries();
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${SITEMAP_BASE_URL}${e.path}</loc>`,
      `    <lastmod>${e.lastmod}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface SitemapValidationError {
  path: string;
  reason: string;
  value?: string;
}

export function validateSitemapEntries(entries: SitemapEntry[]): SitemapValidationError[] {
  const errors: SitemapValidationError[] = [];
  for (const entry of entries) {
    const { path, lastmod } = entry;
    if (!lastmod) {
      errors.push({ path, reason: "missing lastmod" });
      continue;
    }
    if (!ISO_DATE_REGEX.test(lastmod)) {
      errors.push({ path, reason: "lastmod does not match YYYY-MM-DD", value: lastmod });
      continue;
    }
    const [y, m, d] = lastmod.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (
      dt.getUTCFullYear() !== y ||
      dt.getUTCMonth() !== m - 1 ||
      dt.getUTCDate() !== d
    ) {
      errors.push({ path, reason: "lastmod is not a valid calendar date", value: lastmod });
      continue;
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (dt.getTime() > today.getTime()) {
      errors.push({ path, reason: "lastmod is in the future", value: lastmod });
    }
  }
  return errors;
}
