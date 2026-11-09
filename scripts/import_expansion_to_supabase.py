#!/usr/bin/env python3
"""
Format and upload all 1800 expansion clinics to Supabase database.
"""

import json
import ssl
import urllib.request
import urllib.error
import time

SSL_CTX = ssl._create_unverified_context()
SUPABASE_URL = "https://tfhyvrbaktxdpmqujlft.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaHl2cmJha3R4ZHBtcXVqbGZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1NzEzNSwiZXhwIjoyMTAxODMzMTM1fQ.9OMKJdrOBNnMBQ_83OJex5mHOyYP0IGJMXVpRT6Aqik"

def map_region(c):
    reg = c.get('region', '')
    stad = (c.get('stad') or '').strip()
    kommun = (c.get('kommun') or '').strip()
    
    # 1. Stockholm area
    if 'Stockholm' in reg or kommun in [
        'Stockholm', 'Södertälje', 'Sollentuna', 'Solna', 'Haninge', 'Järfälla',
        'Nacka', 'Sigtuna', 'Sundbyberg', 'Huddinge', 'Upplands Väsby', 'Tyresö',
        'Botkyrka', 'Danderyd', 'Värmdö', 'Lidingö', 'Täby', 'Österåker', 'Vallentuna', 'Ekerö'
    ]:
        return 'stockholm'
        
    # 2. Göteborg area
    if kommun in ['Göteborg', 'Mölndal', 'Partille', 'Kungälv', 'Lerum', 'Härryda', 'Kungsbacka', 'Alingsås', 'Öckerö']:
        return 'goteborg'
        
    # 3. Borås
    if kommun in ['Borås', 'Ulricehamn']:
        return 'boras'
        
    # 4. Uppsala
    if 'Uppsala' in reg or kommun in ['Uppsala', 'Knivsta']:
        return 'uppsala'
        
    # 5. Skåne
    if kommun in ['Malmö', 'Burlöv', 'Lomma', 'Vellinge', 'Svedala', 'Staffanstorp', 'Kävlinge']:
        return 'malmo'
    if kommun in ['Helsingborg', 'Höganäs']:
        return 'helsingborg'
    if kommun == 'Lund':
        return 'lund'
    if kommun == 'Kristianstad':
        return 'kristianstad'
    if kommun == 'Landskrona':
        return 'landskrona'
    if kommun == 'Trelleborg':
        return 'trelleborg'
    if kommun == 'Ystad':
        return 'ystad'
    if kommun == 'Ängelholm':
        return 'angelholm'
        
    # 6. Halland & Västkust
    if kommun == 'Halmstad':
        return 'halmstad'
    if kommun == 'Varberg':
        return 'varberg'
    if kommun == 'Falkenberg':
        return 'falkenberg'
    if kommun == 'Trollhättan':
        return 'trollhattan'
    if kommun == 'Uddevalla':
        return 'uddevalla'
    if kommun == 'Skövde':
        return 'skovde'
        
    # 7. Other major cities
    if kommun == 'Eskilstuna':
        return 'eskilstuna'
    if kommun == 'Gävle':
        return 'gavle'
    if kommun == 'Karlstad':
        return 'karlstad'
    if kommun == 'Sundsvall':
        return 'sundsvall'
    if kommun == 'Växjö':
        return 'vaxjo'
    if kommun == 'Kalmar':
        return 'kalmar'
    if kommun == 'Östersund':
        return 'ostersund'
    if kommun == 'Luleå':
        return 'lulea'
    if kommun in ['Linköping', 'Norrköping']:
        return 'linkoping' if kommun == 'Linköping' else 'norrkoping'
    if kommun == 'Örebro':
        return 'orebro'
    if kommun == 'Västerås':
        return 'vasteras'
    if kommun == 'Jönköping':
        return 'jonkoping'
    if kommun == 'Umeå':
        return 'umea'
        
    return 'stockholm'

def format_clinic_for_db(c):
    region = map_region(c)
    
    # Format services
    services = []
    if c.get('har_naprapat'): services.append('naprapat')
    if c.get('har_kiropraktor'): services.append('kiropraktor')
    if c.get('har_massage'): services.append('massage')
    if c.get('har_fysioterapeut'): services.append('fysioterapeut')
    if not services:
        services = ['massage']
        
    # Format practitioners
    practitioners = []
    raw_utovare = c.get('utovare') or []
    if isinstance(raw_utovare, list):
        for u in raw_utovare:
            if isinstance(u, dict) and u.get('namn'):
                titel = f" ({u['titel']})" if u.get('titel') else ""
                practitioners.append(f"{u['namn']}{titel}".strip())
            elif isinstance(u, str) and u.strip():
                practitioners.append(u.strip())
                
    # Add email and orgnr tags to practitioners for preservation
    if c.get('epost'):
        practitioners.append(f"email:{c['epost'].strip()}")
    if c.get('organisationsnummer'):
        practitioners.append(f"org_nr:{c['organisationsnummer'].strip()}")
        
    # Source URLs
    source_urls = []
    kallor = c.get('kallor') or []
    if isinstance(kallor, list):
        for k in kallor:
            if isinstance(k, dict) and k.get('url'):
                source_urls.append(k['url'])
            elif isinstance(k, str) and k.startswith('http'):
                source_urls.append(k)
                
    if not source_urls and c.get('bokningsurl'):
        source_urls.append(c['bokningsurl'])

    # Neighborhood / stadsdel fallback
    neighborhood = c.get('stadsdel') or c.get('kommun') or c.get('stad') or "Centrum"

    return {
        'slug': c['slug'],
        'name': c['namn'],
        'region': region,
        'services': services,
        'has_naprapat': bool(c.get('har_naprapat')),
        'has_kiropraktor': bool(c.get('har_kiropraktor')),
        'has_massage': bool(c.get('har_massage')),
        'has_fysioterapeut': bool(c.get('har_fysioterapeut')),
        'city': c.get('stad') or c.get('kommun') or 'Sverige',
        'municipality': c.get('kommun') or c.get('stad') or '',
        'neighborhood': neighborhood,
        'street': c.get('gatuadress') or '',
        'postal': c.get('postnummer') or '',
        'address': c.get('adress') or '',
        'lat': float(c['latitud']) if c.get('latitud') is not None else None,
        'lng': float(c['longitud']) if c.get('longitud') is not None else None,
        'phone': c.get('telefon') or '',
        'website': c.get('webbplats') or '',
        'booking_url': c.get('bokningsurl') or None,
        'booking_platform': c.get('bokningsplattform') or None,
        'rating': float(c['betyg']) if c.get('betyg') is not None else 0.0,
        'review_count': int(c['antal_recensioner']) if c.get('antal_recensioner') is not None else 0,
        'price_level': int(c['prisniva']) if c.get('prisniva') is not None else 2,
        'price_first_visit_sek': int(c['pris_forsta_besok_sek']) if c.get('pris_forsta_besok_sek') is not None else None,
        'description': c.get('beskrivning') or '',
        'featured': False,
        'specialties': c.get('specialiteter') or [],
        'practitioners': practitioners,
        'languages': ['Svenska'],
        'payment_methods': [],
        'accessibility': [],
        'source_urls': source_urls[:5],
        'last_verified_at': c.get('senast_verifierad') or '2026-11-09'
    }

def main():
    json_path = 'nakima-expansion-import/nakima-nya-kliniker-expansion.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        raw_clinics = json.load(f)
        
    print(f"Loaded {len(raw_clinics)} clinics from {json_path}")
    
    db_rows = [format_clinic_for_db(c) for c in raw_clinics]
    
    batch_size = 100
    total_batches = (len(db_rows) + batch_size - 1) // batch_size
    url = f"{SUPABASE_URL}/rest/v1/clinics?on_conflict=slug"
    
    print(f"Starting upload of {len(db_rows)} rows in {total_batches} batches...")
    
    success_count = 0
    for i in range(total_batches):
        batch = db_rows[i * batch_size : (i + 1) * batch_size]
        payload = json.dumps(batch).encode('utf-8')
        
        req = urllib.request.Request(url, data=payload, headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        })
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as resp:
                    if resp.status in (200, 201, 204):
                        success_count += len(batch)
                        print(f"Batch {i + 1}/{total_batches} ({len(batch)} rows) uploaded successfully. Total: {success_count}/{len(db_rows)}")
                        break
            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                print(f"Batch {i + 1} attempt {attempt + 1} failed: HTTP {e.code} - {err_body}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(2)
            except Exception as e:
                print(f"Batch {i + 1} attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(2)
                
    print(f"\n==========================================")
    print(f"UPLOAD COMPLETE! Total rows upserted: {success_count}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
