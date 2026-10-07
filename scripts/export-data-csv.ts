import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseCsv(text: string, delimiter = ","): any[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  function parseLine(line: string) {
    const res: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === "\"") {
        if (inQuotes && line[i + 1] === "\"") {
          cur += "\"";
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        res.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    res.push(cur.trim());
    return res;
  }

  const headers = parseLine(lines[0]);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx] : "";
    });
    rows.push(obj);
  }
  return rows;
}

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes(";") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvString(headers: string[], rows: Record<string, any>[]): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map(row => {
    return headers.map(h => escapeCsvField(row[h])).join(",");
  });
  // Add UTF-8 BOM so Excel and Numbers open Swedish characters (å, ä, ö) perfectly
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

function categorizePractitioner(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("naprapat")) return "Naprapat";
  if (lower.includes("kiroprakt")) return "Kiropraktor";
  if (lower.includes("fysiotera") || lower.includes("sjukgymnast")) return "Fysioterapeut";
  if (lower.includes("mass")) return "Massage / Massör";
  if (lower.includes("pt") || lower.includes("tränare")) return "Personlig Tränare";
  if (lower.includes("läkare") || lower.includes("ortoped")) return "Läkare";
  return "Behandlare / Övrig";
}

// Explicit verified single-practitioner clinics across regions
const VERIFIED_EXTRA_PRACTITIONERS: Record<string, { name: string; title: string }> = {
  "aktivera-naprapati-andreas-berglund": { name: "Andreas Berglund", title: "Leg. Naprapat" },
  "kiropraktor-boras-hans-johansson": { name: "Hans Johansson", title: "Leg. Kiropraktor" },
  "bodylife": { name: "Regina Strid", title: "Medicinsk Massageterapeut & PT" },
  "anna-redin-yoga-and-massage": { name: "Anna Redin", title: "Dipl. Friskvårdsmassör & Yogalärare" },
  "molndalsnaprapaten": { name: "Anders Bergh", title: "Leg. Naprapat" },
  "naprapat-i-vast": { name: "Sandra Cederberg", title: "Leg. Naprapat" },
  "halsorehab-fredrik-widen": { name: "Fredrik Widén", title: "Leg. Naprapat" },
  "change-by-choice-sandra-olsson": { name: "Sandra Olsson", title: "Leg. Naprapat" },
  "eva-rytterlund-leg-naprapat": { name: "Eva Rytterlund", title: "Leg. Naprapat" },
  "jc-fysio-jenny-carlsson": { name: "Jenny Carlsson", title: "Leg. Fysioterapeut" },
  "naprapateliten": { name: "Olle Holmertz", title: "Leg. Naprapat" },
  "norrkoping-kiropraktorklinik-moa-holdaj": { name: "Moa Holdaj", title: "Leg. Kiropraktor" },
  "omt-kliniken-cumhur-kaya": { name: "Cumhur Kaya", title: "Leg. Fysioterapeut / OMT-specialist" },
  "zona-by-louise": { name: "Louise Lindén", title: "Cert. Massageterapeut" },
  "leo-massage": { name: "Jonas Satiya", title: "Cert. Massör" },
  "tdhs-massage": { name: "Thom Dingsten Hellberg", title: "Cert. Massageterapeut & Lotorpsterapeut" },
  "mariannes-massage-and-halsa": { name: "Marianne Granevald", title: "Cert. Massageterapeut" },
  "re-massage-ab": { name: "Robert Elgstrand", title: "Cert. Massör" },
  "jonas-lowendahl-massage-och-friskvard": { name: "Jonas Löwendahl", title: "Cert. Massör & Laserterapeut" },
  "johanna-sandstrak-massage-and-friskvard": { name: "Johanna Sandstrak", title: "Cert. Massageterapeut" },
  "massage-guldkant": { name: "Sara Lindbeck", title: "Massör" },
  "munkhammar-medicinsk-massage": { name: "Johan Munkhammar", title: "Cert. Medicinsk Massageterapeut" },
  "proffshander-massage-jonkoping": { name: "Valeria Eriksson", title: "Cert. Massageterapeut" },
  "massage-corner-sverige-ab": { name: "Olga Gustafson", title: "Dipl. Massör" },
  "harmoni-massage-and-halsa": { name: "Anna Hagelin Gustavsson", title: "Massageterapeut & Naturterapeut" },
  "naprapaten-nu-anders-jakobsson": { name: "Anders Jakobsson", title: "Leg. Naprapat" },
  "peder-massor": { name: "Peder Gottfridsson", title: "Dipl. Massör" },
  "umea-muskelterapi-and-friskvard": { name: "Stefan Wörlén", title: "Dipl. Massageterapeut & AkuNova-akupunktör" },
  "ma-prima-massage-och-friskvard-i-norr": { name: "Karin Brunesson", title: "Medicinsk Massageterapeut" },
  "ro-givande": { name: "Carina Rydén", title: "Spaterapeut & Friskvårdsmassör" },
  "elisabeth-care": { name: "Ita Skoog Hansen", title: "Massageterapeut" },
  "halsoresursen": { name: "Emma Fråhn", title: "Cert. Massör & Andningsterapeut" },
  "physiotherapy-stockholm-anna-magnusson-sogell": { name: "Anna Magnusson Sogell", title: "Leg. Fysioterapeut" },
  "sjukgymnast-goteborg-ab-ulf-aberg": { name: "Ulf Åberg", title: "Leg. Fysioterapeut / Sjukgymnast" },
  "fysioterapi-eva-h-gustafsson": { name: "Eva H Gustafsson", title: "Leg. Fysioterapeut" },
  "l-palmer-fysioterapi-ab": { name: "Lars Palmér", title: "Leg. Fysioterapeut" },
  "gustav-nordstrom-fysioterapi-ab": { name: "Gustav Nordström", title: "Leg. Fysioterapeut" },
  "helena-kall-fysioterapi-ab": { name: "Helena Käll", title: "Leg. Fysioterapeut" },
  "anna-edstroms-fysioterapi-ab": { name: "Anna Edström", title: "Leg. Fysioterapeut" },
  "louise-l-von-bergen-fysioterapi-ab": { name: "Louise L von Bergen", title: "Leg. Fysioterapeut" },
  "a-marklund-fysioterapi-ab": { name: "A. Marklund", title: "Leg. Fysioterapeut" },
  "peter-ehlin-fysioterapi-ab": { name: "Peter Ehlin", title: "Leg. Fysioterapeut" },
  "viktoria-astrom-fysioterapi-ab": { name: "Viktoria Åström", title: "Leg. Fysioterapeut" },
  "lisa-hedberg-sjukgymnastik-ab": { name: "Lisa Hedberg", title: "Leg. Fysioterapeut / Sjukgymnast" },
  "viveka-nyman-fysioterapi-ab": { name: "Viveka Nyman", title: "Leg. Fysioterapeut" },
  "bertil-fysioterapeut-fysioteamet-stockholm": { name: "Bertil", title: "Leg. Fysioterapeut" }
};

async function main() {
  console.log("Hämtar alla kliniker från Supabase...");
  const { data: dbClinics, error } = await supabase.from("clinics").select("*").order("region").order("name");
  if (error || !dbClinics) {
    console.error("Fel vid hämtning från Supabase:", error);
    process.exit(1);
  }

  console.log(`Läste in ${dbClinics.length} kliniker från databasen.`);

  // Load auxiliary data files
  const existingCsvPath = path.resolve(process.cwd(), "../nakima-alla-kliniker.csv");
  const uppsalaCsvPath = path.resolve(process.cwd(), "../nakima_kliniker_se Uppsala.csv");
  const fysio1Path = path.resolve(process.cwd(), "scripts/fysioterapeuter.json");
  const fysio2Path = path.resolve(process.cwd(), "scripts/fysioterapeuter-stockholm.json");

  const existingCsv = fs.existsSync(existingCsvPath) ? parseCsv(fs.readFileSync(existingCsvPath, "utf8"), ",") : [];
  const uppsalaCsv = fs.existsSync(uppsalaCsvPath) ? parseCsv(fs.readFileSync(uppsalaCsvPath, "utf8"), ";") : [];
  const fysioList = [
    ...(fs.existsSync(fysio1Path) ? JSON.parse(fs.readFileSync(fysio1Path, "utf8")) : []),
    ...(fs.existsSync(fysio2Path) ? JSON.parse(fs.readFileSync(fysio2Path, "utf8")) : [])
  ];

  const existingMap = new Map(existingCsv.map((c: any) => [c.slug, c]));
  const uppsalaMap = new Map(uppsalaCsv.map((c: any) => [c.slug, c]));
  const fysioMap = new Map(fysioList.map((f: any) => [f.name.toLowerCase().trim(), f]));

  const clinicRows: Record<string, any>[] = [];
  const practitionerRows: Record<string, any>[] = [];

  for (const c of dbClinics) {
    const ext = existingMap.get(c.slug) || uppsalaMap.get(c.slug);
    const fysio = fysioMap.get(c.name.toLowerCase().trim());

    // Merge org_number and corporate data
    let orgNumber = ext?.org_number || null;
    let legalName = ext?.legal_name || null;
    let fSkatt = ext?.f_skatt || null;
    let dataConfidence = ext?.data_confidence || null;

    if (!orgNumber && fysio?.org_nr) {
      orgNumber = fysio.org_nr;
      if (!fSkatt) fSkatt = "Ja";
    }

    // Extract clean practitioners
    const cleanPractitioners: { raw: string; name: string; title: string; category: string }[] = [];

    // 1. From database array
    if (Array.isArray(c.practitioners)) {
      for (const p of c.practitioners) {
        if (!p) continue;
        const trimmed = p.trim();
        if (trimmed.startsWith("org_nr:")) {
          if (!orgNumber) orgNumber = trimmed.replace("org_nr:", "").trim();
          continue;
        }
        if (trimmed.length === 0) continue;

        const match = trimmed.match(/^([^(]+)(?:\((.*)\))?$/);
        const name = (match ? match[1] : trimmed).trim();
        const title = (match && match[2] ? match[2] : "").trim();
        const category = categorizePractitioner(trimmed);

        cleanPractitioners.push({
          raw: trimmed,
          name,
          title,
          category
        });
      }
    }

    // 2. If empty in DB, check existing CSV utövare
    if (cleanPractitioners.length === 0 && ext?.utövare) {
      const parts = ext.utövare.split("|").map((s: string) => s.trim()).filter(Boolean);
      for (const p of parts) {
        const match = p.match(/^([^(]+)(?:\((.*)\))?$/);
        const name = (match ? match[1] : p).trim();
        const title = (match && match[2] ? match[2] : "").trim();
        cleanPractitioners.push({
          raw: p,
          name,
          title,
          category: categorizePractitioner(p)
        });
      }
    }

    // 3. If still empty, check verified extra practitioners
    if (cleanPractitioners.length === 0 && VERIFIED_EXTRA_PRACTITIONERS[c.slug]) {
      const ind = VERIFIED_EXTRA_PRACTITIONERS[c.slug];
      const raw = `${ind.name} (${ind.title})`;
      cleanPractitioners.push({
        raw,
        name: ind.name,
        title: ind.title,
        category: categorizePractitioner(ind.title)
      });
    }

    // Format services and details
    const servicesList = Array.isArray(c.services) ? c.services.join("|") : (c.services || "");
    const specialtiesList = Array.isArray(c.specialties) ? c.specialties.join("|") : (c.specialties || "");
    const languagesList = Array.isArray(c.languages) ? c.languages.join("|") : "";
    const paymentList = Array.isArray(c.payment_methods) ? c.payment_methods.join("|") : "";
    const accessList = Array.isArray(c.accessibility) ? c.accessibility.join("|") : "";
    const sourceUrlsList = Array.isArray(c.source_urls) ? c.source_urls.join("|") : "";

    const practitionerNamesString = cleanPractitioners.map(p => p.raw).join("; ");

    // Clinic Row
    clinicRows.push({
      slug: c.slug,
      namn: c.name,
      juridiskt_namn: legalName || c.name,
      organisationsnummer: orgNumber || "",
      f_skatt: fSkatt || (orgNumber ? "Ja" : ""),
      region: c.region,
      stad: c.city || "",
      kommun: c.municipality || "",
      stadsdel: c.neighborhood || "",
      gatuadress: c.street || "",
      postnummer: c.postal || "",
      adress: c.address || "",
      latitud: c.lat ?? "",
      longitud: c.lng ?? "",
      telefon: c.phone || "",
      webbplats: c.website || "",
      bokningsurl: c.booking_url || "",
      bokningsplattform: c.booking_platform || "",
      tjanster: servicesList,
      har_naprapat: c.has_naprapat ? "true" : "false",
      har_kiropraktor: c.has_kiropraktor ? "true" : "false",
      har_massage: c.has_massage ? "true" : "false",
      har_fysioterapeut: c.has_fysioterapeut ? "true" : "false",
      specialiteter: specialtiesList,
      antal_utovare: cleanPractitioners.length,
      utovare: practitionerNamesString,
      betyg: c.rating ?? "",
      antal_recensioner: c.review_count ?? "",
      prisniva: c.price_level ?? "",
      pris_forsta_besok_sek: c.price_first_visit_sek ?? "",
      beskrivning: c.description || "",
      redaktionellt_utvald: c.featured ? "true" : "false",
      oppettider_sammanfattning: c.opening_hours_summary || "",
      oppettider_man: c.hours_mon || "",
      oppettider_tis: c.hours_tue || "",
      oppettider_ons: c.hours_wed || "",
      oppettider_tor: c.hours_thu || "",
      oppettider_fre: c.hours_fri || "",
      oppettider_lor: c.hours_sat || "",
      oppettider_son: c.hours_sun || "",
      grundat_ar: c.established ?? "",
      sprak: languagesList,
      betalningsmetoder: paymentList,
      tillganglighet: accessList,
      kallor: sourceUrlsList,
      senast_verifierad: c.last_verified_at || "",
      datatillforlitlighet: dataConfidence || (c.last_verified_at ? "High - verifierad" : "Medium")
    });

    // Practitioner rows
    for (const p of cleanPractitioners) {
      practitionerRows.push({
        utovare_namn: p.name,
        titel_legitimation: p.title,
        yrkeskategori: p.category,
        fullstandig_beteckning: p.raw,
        klinik_namn: c.name,
        klinik_slug: c.slug,
        organisationsnummer: orgNumber || "",
        region: c.region,
        stad: c.city || "",
        kommun: c.municipality || "",
        adress: c.address || "",
        telefon: c.phone || "",
        webbplats: c.website || "",
        bokningsurl: c.booking_url || "",
        bokningsplattform: c.booking_platform || "",
        klinik_betyg: c.rating ?? "",
        klinik_antal_recensioner: c.review_count ?? "",
        klinik_tjanster: servicesList,
        klinik_specialiteter: specialtiesList
      });
    }
  }

  const clinicHeaders = Object.keys(clinicRows[0]);
  const clinicCsvString = toCsvString(clinicHeaders, clinicRows);

  const practitionerHeaders = Object.keys(practitionerRows[0]);
  const practitionerCsvString = toCsvString(practitionerHeaders, practitionerRows);

  // Write files to both nakima.se and parent directory
  const destClinics1 = path.resolve(process.cwd(), "nakima-alla-kliniker-och-utovare.csv");
  const destClinics2 = path.resolve(process.cwd(), "../nakima-alla-kliniker-och-utovare.csv");
  const destPractitioners1 = path.resolve(process.cwd(), "nakima-alla-utovare-detaljerad.csv");
  const destPractitioners2 = path.resolve(process.cwd(), "../nakima-alla-utovare-detaljerad.csv");

  fs.writeFileSync(destClinics1, clinicCsvString, "utf8");
  fs.writeFileSync(destClinics2, clinicCsvString, "utf8");
  fs.writeFileSync(destPractitioners1, practitionerCsvString, "utf8");
  fs.writeFileSync(destPractitioners2, practitionerCsvString, "utf8");

  const clinicsWithPractitioners = clinicRows.filter(c => c.antal_utovare > 0).length;

  console.log("========================================");
  console.log("           EXPORT GENOMFÖRD             ");
  console.log("========================================");
  console.log(`Totalt exporterade kliniker: ${clinicRows.length}`);
  console.log(`Kliniker med namngivna utövare: ${clinicsWithPractitioners} (${Math.round(clinicsWithPractitioners/clinicRows.length*100)}%)`);
  console.log(`Totalt exporterade individuella utövare: ${practitionerRows.length}`);
  console.log("");
  console.log("Filer skapade:");
  console.log(`1. Masterfil kliniker:`);
  console.log(`   - ${destClinics1}`);
  console.log(`   - ${destClinics2}`);
  console.log(`2. Detaljerad utövarfil:`);
  console.log(`   - ${destPractitioners1}`);
  console.log(`   - ${destPractitioners2}`);
  console.log("========================================");
}

main().catch(err => {
  console.error("Export error:", err);
  process.exit(1);
});
