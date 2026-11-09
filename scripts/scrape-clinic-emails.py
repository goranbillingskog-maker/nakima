#!/usr/bin/env python3
"""
Scrape contact emails from listed clinic websites for Nakima.se outreach.
"""

import csv
import json
import re
import sys
import os
import ssl
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

# Exclude false positives, vendors, web designers, standard platforms
IGNORED_DOMAINS = {
    'wix.com', 'wixpress.com', 'sentry.io', 'wordpress.org', 'wordpress.com',
    'example.com', 'domain.com', 'schema.org', 'google.com', 'googleapis.com',
    'facebook.com', 'instagram.com', 'bokadirekt.se', 'timecenter.se', 'klarna.com',
    'cloudflare.com', 'github.com', 'squarespace.com', 'godaddy.com', 'apple.com'
}

IGNORED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js')

SSL_CTX = ssl._create_unverified_context()
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Nakima Verification/1.0)"

def clean_email(email):
    email = email.strip().lower()
    # strip trailing punctuation
    email = re.sub(r'[\.,;:\)>"\']+$', '', email)
    if any(email.endswith(ext) for ext in IGNORED_EXTENSIONS):
        return None
    domain = email.split('@')[-1]
    if domain in IGNORED_DOMAINS:
        return None
    if not (3 <= len(domain) <= 60):
        return None
    return email

def extract_emails_from_html(html):
    found = set()
    if not html:
        return found
    # Find mailto: links first (highest confidence)
    for m in re.finditer(r'mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})', html, re.IGNORECASE):
        cleaned = clean_email(m.group(1))
        if cleaned:
            found.add(cleaned)
    # Find any plaintext email in html
    for raw in EMAIL_REGEX.findall(html):
        cleaned = clean_email(raw)
        if cleaned:
            found.add(cleaned)
    return found

def fetch_url(url, timeout=6):
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        )
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            # Only read up to 1MB of text
            content_type = resp.headers.get('Content-Type', '')
            if 'image' in content_type or 'pdf' in content_type:
                return None
            body = resp.read(1_000_000).decode('utf-8', errors='ignore')
            return body
    except Exception:
        return None

def find_emails_for_website(base_url):
    if not base_url or not base_url.startswith('http'):
        return set()

    emails = set()
    # Normalize base url
    parsed = urllib.parse.urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"

    # 1. Fetch homepage
    home_html = fetch_url(base_url)
    if home_html:
        emails.update(extract_emails_from_html(home_html))

    # If emails found already, return early
    if emails:
        return emails

    # 2. Try common contact pages
    candidate_paths = ['/kontakt', '/kontakta-oss', '/kontakt-oss', '/contact', '/om-oss', '/om-kliniken']
    # Check if there are internal contact links in home_html
    if home_html:
        link_matches = re.findall(r'href=["\'](/[^"\']*(?:kontakt|contact)[^"\']*)["\']', home_html, re.IGNORECASE)
        for link in link_matches[:3]:
            full = urllib.parse.urljoin(root, link)
            if full not in candidate_paths:
                candidate_paths.insert(0, link)

    for path in candidate_paths[:4]:
        page_url = urllib.parse.urljoin(root, path)
        html = fetch_url(page_url, timeout=5)
        if html:
            sub_emails = extract_emails_from_html(html)
            if sub_emails:
                emails.update(sub_emails)
                break

    return emails

def pick_best_email(emails, clinic_name=""):
    if not emails:
        return ""
    # Sort by priority: info@, kontakt@, boka@, reception@, or containing clinic keywords
    prio_prefixes = ['kontakt', 'info', 'reception', 'boka', 'support', 'hej', 'halsa']
    
    def score(e):
        name_part = e.split('@')[0]
        for idx, pref in enumerate(prio_prefixes):
            if name_part.startswith(pref):
                return idx
        return 50

    sorted_emails = sorted(emails, key=score)
    return sorted_emails[0]

def main():
    csv_file = "nakima-alla-kliniker-och-utovare.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found")
        sys.exit(1)

    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        clinics = list(csv.DictReader(f))

    print(f"Loaded {len(clinics)} clinics from {csv_file}")

    # Load known staging emails
    staging_emails = {}
    for sf in ["scripts/fysioterapeuter.json", "scripts/fysioterapeuter-stockholm.json"]:
        if os.path.exists(sf):
            try:
                with open(sf) as f:
                    data = json.load(f)
                for d in data:
                    if d.get('email'):
                        staging_emails[d.get('name', '').lower().strip()] = d.get('email').strip().lower()
            except Exception:
                pass

    print(f"Loaded {len(staging_emails)} staging emails as initial cache")

    # Filter clinics that need scraping
    websites_to_scrape = []
    results = {}

    for c in clinics:
        slug = c['slug']
        name = c['namn']
        web = c.get('webbplats', '').strip()
        
        # Check if already in staging cache
        clean_name = name.lower().strip()
        found_cached = None
        for s_name, s_email in staging_emails.items():
            if s_name in clean_name or clean_name in s_name:
                found_cached = s_email
                break

        if found_cached:
            results[slug] = [found_cached]
        elif web and web.startswith('http') and 'bokadirekt' not in web:
            websites_to_scrape.append((slug, name, web))
        else:
            results[slug] = []

    print(f"Clinics with scrapeable websites: {len(websites_to_scrape)}")
    print(f"Clinics already cached with emails: {len([s for s, e in results.items() if e])}")
    print("Starting concurrent website scraper (workers=20)...")

    completed_count = 0
    found_count = 0

    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_clinic = {
            executor.submit(find_emails_for_website, web): (slug, name, web)
            for (slug, name, web) in websites_to_scrape
        }

        for future in as_completed(future_to_clinic):
            slug, name, web = future_to_clinic[future]
            completed_count += 1
            try:
                emails = future.result()
            except Exception:
                emails = set()

            if emails:
                found_count += 1
                results[slug] = list(emails)
                print(f"[{completed_count}/{len(websites_to_scrape)}] FOUND {len(emails)}: {name} -> {', '.join(emails)}")
            else:
                results[slug] = []
                if completed_count % 25 == 0:
                    print(f"[{completed_count}/{len(websites_to_scrape)}] in progress... (Total emails found so far: {found_count})")

    print("\n" + "="*50)
    print("Scraping finished. Building outreach CSV...")

    outreach_rows = []
    total_emails = 0

    for c in clinics:
        slug = c['slug']
        name = c['namn']
        region = c['region']
        city = c.get('stad', '')
        phone = c.get('telefon', '')
        website = c.get('webbplats', '')
        booking_url = c.get('bokningsurl', '')
        practitioners = c.get('utovare', '')
        
        # Determine service slug for URL
        if c.get('har_naprapat') == 'true':
            service = 'naprapat'
        elif c.get('har_kiropraktor') == 'true':
            service = 'kiropraktor'
        elif c.get('har_massage') == 'true':
            service = 'massage'
        elif c.get('har_fysioterapeut') == 'true':
            service = 'fysioterapeut'
        else:
            service = 'naprapat'

        nakima_url = f"https://nakima.se/{service}/{region}/{slug}"
        
        emails_list = results.get(slug, [])
        best_email = pick_best_email(emails_list, name)
        all_emails_str = "; ".join(emails_list)

        if best_email:
            total_emails += 1

        outreach_rows.append({
            'slug': slug,
            'namn': name,
            'stad': city,
            'region': region,
            'epost': best_email,
            'alla_epostadresser': all_emails_str,
            'telefon': phone,
            'webbplats': website,
            'bokningsurl': booking_url,
            'utovare': practitioners,
            'nakima_profil_url': nakima_url,
            'har_epost': 'Ja' if best_email else 'Nej'
        })

    # Sort so clinics with emails are at the top
    outreach_rows.sort(key=lambda r: (0 if r['har_epost'] == 'Ja' else 1, r['stad'], r['namn']))

    out_file = "nakima-kontakt-outreach.csv"
    headers = [
        'namn', 'stad', 'region', 'epost', 'nakima_profil_url', 'telefon',
        'webbplats', 'bokningsurl', 'utovare', 'slug', 'har_epost', 'alla_epostadresser'
    ]

    with open(out_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(outreach_rows)

    print(f"Saved outreach dataset to {out_file}")
    print(f"Total clinics with contact email: {total_emails} / {len(clinics)} ({round(total_emails/len(clinics)*100, 1)}%)")
    print("="*50)

if __name__ == "__main__":
    main()
