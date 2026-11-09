# Uppdrag till HyperAgent: Berikning av Kontakt-epost för 258 Listade Kliniker på Nakima.se

**Mottagare:** HyperAgent (Autonomous Web Scraping & Research Agent)  
**Uppdragsgivare:** Nakima.se  
**Mål:** Hitta och verifiera kontakt-epostadresser för de 258 kliniker som för närvarande saknar e-post, så att Nakima kan genomföra ett lanseringsutskick ("Er klinik finns nu listad på Nakima.se").

---

## 1. Bakgrund

Nakima.se har idag 500 verifierade kliniker inom naprapati, kiropraktik, fysioterapi och massage.
- **242 kliniker** har redan identifierade kontaktmejl.
- **258 kliniker** saknar fortfarande e-postadress.

Målet med detta uppdrag är att uppnå **> 85–90 % e-posttäckning** genom att undersöka de 258 klinikerna via alternativa källor (Bokadirekt-profiler, bolagsregister, sökmotorer och sociala medier).

---

## 2. Indatafil

Du har fått filen **`kliniker-att-berika-med-epost.csv`** som innehåller följande fält för varje klinik:
- `slug`: Unikt id för kliniken
- `namn`: Klinikens namn
- `stad`: Stad / tätort
- `region`: Region
- `gatuadress` & `postnummer`: Besöksadress
- `telefon`: Registrerat telefonnummer
- `webbplats`: Befintlig webblänk (om sådan fanns)
- `bokningsurl`: Direktlänk till bokningssystem (t.ex. Bokadirekt)
- `organisationsnummer`: Bolagets organisationsnummer (om tillgängligt)
- `utovare`: Namngivna behandlare på mottagningen
- `nakima_profil_url`: Profilsidan på Nakima
- `epost`: *Tomt fält – ska fyllas i av HyperAgent*
- `epost_kalla`: *Tomt fält – URL där adressen hittades*
- `kommentar`: *Frivillig notering (t.ex. 'Hittad via Bokadirekt', 'Hittad på Facebook')*

---

## 3. Sökmetodik & Prioriterade Källor

HyperAgent ska arbeta metodiskt igenom följande steg för varje post:

### Steg 1: Granska Bokadirekt / Bokningsplattform (Högsta träffsäkerhet)
- Om kolumnen `bokningsurl` har ett värde (t.ex. `https://www.bokadirekt.se/places/...`):
  1. Hämta sidan och sök efter e-post i sektionerna **"Om företaget"**, **"Information från utövaren"** eller under kontaktuppgifter.
  2. Kontrollera om det finns en länk till klinikens externa hemsida, Facebook eller Instagram.

### Steg 2: Granska Hemsidan (om listad i `webbplats`)
- Om hemsidan finns men tidigare automatisk skrapning misslyckades:
  1. Kontrollera om sidan kräver JavaScript-rendering för att visa kontaktuppgifter.
  2. Leta efter maskerade mejladresser (t.ex. `info [at] kliniken.se`, `namn (a) doman.com` eller mailto-knappar bakom ikoner).
  3. Besök specifikt sidorna `/kontakt`, `/om-oss`, `/hitta-hit`, `/personal`.

### Steg 3: Bolagsdata & Officiella Register
- Om `organisationsnummer` finns:
  - Sök på **Allabolag.se**, **Ratsit.se** eller **Eniro/Hitta.se** efter bolagets registrerade kontaktmejl eller officiella webbplats.
- Om `telefon` finns:
  - Sök på telefonnumret på Hitta.se / Eniro.se för att hitta tillhörande kontaktmejl.

### Steg 4: Riktad Google-sökning
Använd följande sökoperatorer i sökmotorn:
- `"[namn]"` `"[stad]"` (epost OR mail OR "@")
- `"[namn]"` `"[gatuadress]"`
- `"[utovare_namn]"` `"[stad]"` naprapat OR kiropraktor OR massage OR fysioterapeut

### Steg 5: Sociala Medier (Facebook & Instagram)
- Många mindre mottagningar och enskilda terapeuter driver sin verksamhet via en Facebook-sida eller Instagram-profil.
- Sök `site:facebook.com "[namn]"` eller `site:instagram.com "[namn]"`.
- Extrahera e-post från sektionen "Page Transparency", "About" eller "Bio".

---

## 4. Kvalitetskrav & Validering

1. **Prioritera allmänna kontaktadresser eller huvudterapeut:**
   - 1:a hand: `kontakt@...`, `info@...`, `reception@...`, `boka@...`
   - 2:a hand: Behandlarens personliga arbetsmejl (`fornamn@kliniken.se`)
2. **Förbjudna adresser (Ogiltiga):**
   - **Inga plattformsadresser:** `support@bokadirekt.se`, `info@timecenter.se`, `noreply@...`
   - **Inga webbyråmejl:** Undvik webbutvecklarens mejl i sidfoten (t.ex. `info@webbpartner.se`).
   - **Inga placeholder-adresser:** Inga `namn@exempel.se` eller Sentry/Wix-telemetri.
3. **Formatkontroll:** Måste vara en giltig och aktiv e-postadress.
4. **Källdokumentation:** Ange alltid var du hittade mejlen i kolumnen `epost_kalla`.

---

## 5. Leveransformat

Fyll i och spara den uppdaterade filen som **`kliniker-berikade-med-epost-klar.csv`** (UTF-8 med BOM, komma- eller semikolonseparerad) med samtliga kolumner intakta och de nya uppgifterna ifyllda.
