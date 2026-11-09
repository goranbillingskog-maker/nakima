#!/usr/bin/env python3
"""
Export all 2,300 clinics and practitioners from Supabase to:
1. nakima-alla-kliniker-och-utovare.csv (all clinics with complete fields + epost)
2. nakima-kontakt-outreach.csv (outreach-focused CSV with email, phone, Nakima live URL)
3. nakima-alla-utovare-detaljerad.csv (individual practitioners)
Writes both to root ./ and parent ../
"""

import json
import ssl
import os
import csv
import urllib.request
import re

SSL_CTX = ssl._create_unverified_context()
SUPABASE_URL = "https://tfhyvrbaktxdpmqujlft.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaHl2cmJha3R4ZHBtcXVqbGZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1NzEzNSwiZXhwIjoyMTAxODMzMTM1fQ.9OMKJdrOBNnMBQ_83OJex5mHOyYP0IGJMXVpRT6Aqik"

def fetch_all_clinics_from_supabase():
    all_rows = []
    page_size = 1000
    start = 0
    
    while True:
        end = start + page_size - 1
        url = f"{SUPABASE_URL}/rest/v1/clinics?select=*&order=region.asc,name.asc"
        req = urllib.request.Request(
            url,
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Range": f"{start}-{end}",
                "Prefer": "count=exact"
            }
        )
        with urllib.request.urlopen(req, context=SSL_CTX) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            all_rows.extend(data)
            print(f"Hämtade {len(data)} rader (totalt {len(all_rows)})...")
            if len(data) < page_size:
                break
            start += page_size
            
    return all_rows

def categorize_practitioner(title):
    t = (title or "").lower()
    if "naprapat" in t:
        return "Naprapat"
    if "kiroprakt" in t:
        return "Kiropraktor"
    if "fysiotera" in t or "sjukgymnast" in t or "fysio" in t:
        return "Fysioterapeut"
    if "mass" in t:
        return "Massage / Massör"
    if "pt" in t or "tränare" in t:
        return "Personlig Tränare"
    if "läkare" in t or "ortoped" in t:
        return "Läkare"
    return "Behandlare / Övrig"

def determine_primary_service(c):
    if c.get("has_naprapat"):
        return "naprapat"
    if c.get("has_kiropraktor"):
        return "kiropraktor"
    if c.get("has_massage"):
        return "massage"
    if c.get("has_fysioterapeut"):
        return "fysioterapeut"
    services = c.get("services") or []
    if isinstance(services, list):
        for s in services:
            sl = s.lower()
            if "naprapat" in sl: return "naprapat"
            if "kiroprakt" in sl: return "kiropraktor"
            if "mass" in sl: return "massage"
            if "fysio" in sl or "sjukgymnast" in sl: return "fysioterapeut"
    return "naprapat"

def main():
    print("Ansluter till Supabase och hämtar alla kliniker...")
    clinics = fetch_all_clinics_from_supabase()
    print(f"Totalt hämtade från Supabase: {len(clinics)} kliniker")
    
    # Also load initial enriched outreach map if present to ensure 100% email coverage retention
    initial_outreach_emails = {}
    if os.path.exists("nakima-kontakt-outreach.csv"):
        with open("nakima-kontakt-outreach.csv", mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for r in reader:
                slug = r.get("slug")
                email = r.get("epost")
                if slug and email:
                    initial_outreach_emails[slug] = email

    clinic_master_rows = []
    outreach_rows = []
    practitioner_master_rows = []
    
    total_with_email = 0

    for c in clinics:
        slug = c.get("slug") or ""
        name = c.get("name") or ""
        region = c.get("region") or ""
        city = c.get("city") or ""
        phone = c.get("phone") or ""
        website = c.get("website") or ""
        booking_url = c.get("booking_url") or ""
        
        # Extract email and clean practitioners
        raw_practitioners = c.get("practitioners") or []
        clean_practitioners = []
        email = c.get("email") or ""
        org_nr = ""

        if isinstance(raw_practitioners, list):
            for p in raw_practitioners:
                if not isinstance(p, str):
                    continue
                p_str = p.strip()
                if p_str.startswith("email:"):
                    if not email:
                        email = p_str.replace("email:", "").strip()
                elif p_str.startswith("org_nr:"):
                    if not org_nr:
                        org_nr = p_str.replace("org_nr:", "").strip()
                elif p_str:
                    m = re.match(r"^([^(]+)(?:\((.*)\))?$", p_str)
                    p_name = (m.group(1) if m else p_str).strip()
                    p_title = (m.group(2) if m and m.group(2) else "").strip()
                    p_cat = categorize_practitioner(p_title or p_name)
                    clean_practitioners.append({
                        "raw": p_str,
                        "name": p_name,
                        "title": p_title,
                        "category": p_cat
                    })
        elif isinstance(raw_practitioners, str) and raw_practitioners:
            clean_practitioners.append({
                "raw": raw_practitioners,
                "name": raw_practitioners,
                "title": "",
                "category": categorize_practitioner(raw_practitioners)
            })

        if not email and slug in initial_outreach_emails:
            email = initial_outreach_emails[slug]

        has_email = bool(email and "@" in email)
        if has_email:
            total_with_email += 1

        primary_service = determine_primary_service(c)
        nakima_url = f"https://nakima.se/{primary_service}/{region}/{slug}"

        services_str = "|".join(c.get("services") or []) if isinstance(c.get("services"), list) else (c.get("services") or "")
        specialties_str = "|".join(c.get("specialties") or []) if isinstance(c.get("specialties"), list) else (c.get("specialties") or "")
        utovare_str = "; ".join([p["raw"] for p in clean_practitioners])

        # 1. Clinic Master Row
        clinic_master_rows.append({
            "slug": slug,
            "namn": name,
            "juridiskt_namn": name,
            "organisationsnummer": org_nr,
            "f_skatt": "Ja" if org_nr else "",
            "region": region,
            "stad": city,
            "kommun": c.get("municipality") or "",
            "stadsdel": c.get("neighborhood") or "",
            "gatuadress": c.get("street") or "",
            "postnummer": c.get("postal") or "",
            "adress": c.get("address") or "",
            "latitud": c.get("lat") if c.get("lat") is not None else "",
            "longitud": c.get("lng") if c.get("lng") is not None else "",
            "telefon": phone,
            "epost": email,
            "webbplats": website,
            "bokningsurl": booking_url,
            "bokningsplattform": c.get("booking_platform") or "",
            "tjanster": services_str,
            "har_naprapat": "true" if c.get("has_naprapat") else "false",
            "har_kiropraktor": "true" if c.get("has_kiropraktor") else "false",
            "har_massage": "true" if c.get("has_massage") else "false",
            "har_fysioterapeut": "true" if c.get("has_fysioterapeut") else "false",
            "specialiteter": specialties_str,
            "antal_utovare": len(clean_practitioners),
            "utovare": utovare_str,
            "betyg": c.get("rating") if c.get("rating") is not None else "",
            "antal_recensioner": c.get("review_count") if c.get("review_count") is not None else "",
            "prisniva": c.get("price_level") or "",
            "pris_forsta_besok_sek": c.get("price_first_visit_sek") if c.get("price_first_visit_sek") is not None else "",
            "beskrivning": c.get("description") or "",
            "redaktionellt_utvald": "true" if c.get("featured") else "false",
            "oppettider_sammanfattning": c.get("opening_hours_summary") or "",
            "oppettider_man": c.get("hours_mon") or "",
            "oppettider_tis": c.get("hours_tue") or "",
            "oppettider_ons": c.get("hours_wed") or "",
            "oppettider_tor": c.get("hours_thu") or "",
            "oppettider_fre": c.get("hours_fri") or "",
            "oppettider_lor": c.get("hours_sat") or "",
            "oppettider_son": c.get("hours_sun") or "",
            "grundat_ar": c.get("established") if c.get("established") is not None else "",
            "sprak": "|".join(c.get("languages") or []) if isinstance(c.get("languages"), list) else "",
            "betalningsmetoder": "|".join(c.get("payment_methods") or []) if isinstance(c.get("payment_methods"), list) else "",
            "tillganglighet": "|".join(c.get("accessibility") or []) if isinstance(c.get("accessibility"), list) else "",
            "kallor": "|".join(c.get("source_urls") or []) if isinstance(c.get("source_urls"), list) else "",
            "senast_verifierad": c.get("last_verified_at") or "",
            "datatillforlitlighet": "High - verifierad" if c.get("last_verified_at") else "Medium"
        })

        # 2. Outreach Row
        outreach_rows.append({
            "namn": name,
            "stad": city,
            "region": region,
            "epost": email,
            "nakima_profil_url": nakima_url,
            "telefon": phone,
            "webbplats": website,
            "bokningsurl": booking_url,
            "utovare": utovare_str,
            "slug": slug,
            "har_epost": "Ja" if has_email else "Nej",
            "alla_epostadresser": email
        })

        # 3. Individual Practitioner Rows
        for p in clean_practitioners:
            practitioner_master_rows.append({
                "utovare_namn": p["name"],
                "titel_legitimation": p["title"],
                "yrkeskategori": p["category"],
                "fullstandig_beteckning": p["raw"],
                "klinik_namn": name,
                "klinik_slug": slug,
                "organisationsnummer": org_nr,
                "region": region,
                "stad": city,
                "kommun": c.get("municipality") or "",
                "adress": c.get("address") or "",
                "telefon": phone,
                "epost": email,
                "webbplats": website,
                "bokningsurl": booking_url,
                "bokningsplattform": c.get("booking_platform") or "",
                "klinik_betyg": c.get("rating") if c.get("rating") is not None else "",
                "klinik_antal_recensioner": c.get("review_count") if c.get("review_count") is not None else "",
                "klinik_tjanster": services_str,
                "klinik_specialiteter": specialties_str
            })

    # Sort outreach rows with har_epost == 'Ja' first, then city, then name
    outreach_rows.sort(key=lambda r: (0 if r["har_epost"] == "Ja" else 1, r["stad"] or "", r["namn"]))

    def write_csv(filename_rel, fieldnames, data):
        for target_dir in [".", ".."]:
            filepath = os.path.join(target_dir, filename_rel)
            with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            print(f"Skrev {len(data)} rader till {filepath}")

    print("\nSkriver master CSV-filer...")
    write_csv("nakima-alla-kliniker-och-utovare.csv", list(clinic_master_rows[0].keys()), clinic_master_rows)
    write_csv("nakima-kontakt-outreach.csv", list(outreach_rows[0].keys()), outreach_rows)
    if practitioner_master_rows:
        write_csv("nakima-alla-utovare-detaljerad.csv", list(practitioner_master_rows[0].keys()), practitioner_master_rows)

    print("\n========================================")
    print("          EXPORT SLUTFÖRD               ")
    print("========================================")
    print(f"Totalt antal kliniker i masterfil: {len(clinic_master_rows)}")
    print(f"Kliniker med direkt e-post: {total_with_email} / {len(clinic_master_rows)} ({round(total_with_email/len(clinic_master_rows)*100, 1)}%)")
    print(f"Totalt antal individuella utövare: {len(practitioner_master_rows)}")
    print("========================================")

if __name__ == "__main__":
    main()
