# Uppdrag till HyperAgent: Insamling och Berikning av 2 000–3 000 Kliniker & Behandlare i Sverige för Nakima.se

**Mottagare:** HyperAgent (Autonomous Web Scraping & Research Agent)  
**Uppdragsgivare:** Nakima.se (Sveriges ledande guide och katalog för manuell medicin)  
**Mål:** Insamla, strukturera och berika 2 000–3 000 aktiva kliniker och behandlare i Sverige inom manuell medicin och fysioterapi, levererat i en standardiserad CSV/JSON-fil redo för direktimport till Nakimas databas.

---

## 1. Bakgrund & Uppdragets Syfte

Nakima.se samlar Sveriges legitimerade och certifierade utövare inom:
1. **Naprapati** (Leg. Naprapater)
2. **Kiropraktik** (Leg. Kiropraktorer)
3. **Fysioterapi / Sjukgymnastik** (Leg. Fysioterapeuter med privatmottagning eller regionavtal)
4. **Massage & Manuell Terapi** (Certifierade Massörer och Medicinska Massageterapeuter)

Idag har Nakima 500 kliniker och 349 utövare i 12 städer. Målet är att skala upp katalogen till att täcka **hela Sverige** (både nya städer och förtätning av kranskommuner och storstäder), med en total volym på **2 000–3 000 nya kliniker och behandlare**.

---

## 2. Prioriterade Geografiska Områden

### Prioritet 1: Nya medelstora och större städer (Helt vita fläckar idag)
Insamla samtliga kliniker och behandlare i följande städer:
- **Skåne:** Lund, Kristianstad, Landskrona, Ystad, Ängelholm, Trelleborg, Hässleholm
- **Halland & Västkust:** Halmstad, Varberg, Kungsbacka, Trollhättan, Uddevalla, Skövde, Alingsås, Falkenberg
- **Mellansverige:** Eskilstuna, Gävle, Karlstad, Falun, Borlänge, Nyköping, Motala, Enköping
- **Småland & Sydost:** Växjö, Kalmar, Karlskrona, Karlshamn, Värnamo, Oskarshamn, Västervik
- **Norrland:** Sundsvall, Östersund, Skellefteå, Luleå, Piteå, Örnsköldsvik, Boden, Kiruna
- **Övrigt:** Gotland (Visby), Åre, Sälen

### Prioritet 2: Förtätning i befintliga storstadsregioner & kranskommuner
- **Stockholm:** Nacka, Täby, Sollentuna, Södertälje, Järfälla, Huddinge, Solna, Sundbyberg, Lidingö, Tyresö, Danderyd, Upplands Väsby, Sigtuna/Märsta, Norrtälje, Haninge
- **Göteborg:** Mölndal, Partille, Kungälv, Lerum, Härryda (Mölnlycke), Kungsbacka, Torslanda
- **Malmö / Öresund:** Lomma, Staffanstorp, Vellinge, Svedala, Burlöv, Kävlinge

---

## 3. Officiella Källor & Datainsamlingsmetodik

HyperAgent ska använda följande primära och sekundära källor för datainsamling:

### Källa A: Bokningsplattformar (Bäst för omdömen, behandlare och bokningslänkar)
- **Bokadirekt.se (`https://www.bokadirekt.se/`):**
  - Sök per ort och kategori: `Naprapat`, `Kiropraktor`, `Massage`, `Fysioterapeut / Sjukgymnast`
  - Extrahera: Kliniknamn, adress, postnummer, ort, telefon, webbadress, direkt bokningslänk (`booking_url`), betyg (rating), antal recensioner, tjänster, priser samt **namn och titel på alla listade utövare/terapeuter på kliniken**.
- **BokaMera, TimeCenter, Kuralink / Myaimi:**
  - Kompletterande bokningssystem som används av större naprapat- och kiropraktorkedjor.

### Källa B: Yrkesförbundens Officiella Medlemsregister (Garanterad legitimation & kvalitet)
- **Svenska Naprapatförbundet (`https://naprapater.se/hitta-naprapat/`):**
  - Rikstäckande katalog över samtliga legitimerade medlemmar, kliniknamn, besöksadresser, telefon och webbplatser.
- **Legitimerade Kiropraktorers Riksorganisation (LKR) (`https://kiropraktik.se/hitta-kiropraktor/`):**
  - Rikstäckande medlemsregister över legitimerade kiropraktorer i Sverige.
- **Kroppsterapeuternas Yrkesförbund (`https://kroppsterapeuterna.se/hitta-terapeut/`):**
  - Databas över certifierade massageterapeuter med yrkesutbildning.
- **Fysioterapeuterna (`https://www.fysioterapeuterna.se/`):**
  - Privatpraktiserande fysioterapeuter och specialistmottagningar.

### Källa C: Offentlig Vård & Regionernas Vårdval (Frikort & Vårdavtal)
- **1177 Hitta Vård (`https://www.1177.se/hitta-vard/`):**
  - Sök på "Fysioterapi", "Sjukgymnastik", "Naprapati" och "Kiropraktik".
  - Fångar upp alla privata mottagningar med regionavtal där högkostnadskort/frikort gäller.

### Källa D: Bolagsdata & Validering (Allabolag.se / Ratsit.se)
- **SNI-kod 86905:** *Fysioterapeutisk verksamhet o.d.* (täcker naprapater, kiropraktorer, fysioterapeuter)
- **SNI-kod 96040:** *Kroppsvård* (täcker massörer)
- Används för att hämta korrekt `organisationsnummer`, `juridiskt namn` och verifiera `F-skatt` och aktiv bolagsstatus.

---

## 4. Krav på Datastruktur (CSV / JSON Schema)

HyperAgent ska producera en CSV-fil (semikolon- eller komma-separerad med citationstecken runt textfält, UTF-8 med BOM) samt motsvarande JSON-fil.

Varje post representerar **en klinik/mottagning** med följande fält:

| Kolumnnamn | Datatyp | Beskrivning & Format | Exempel |
| :--- | :--- | :--- | :--- |
| `slug` | String (Unik) | Kebab-case, gemener, endast a-z, 0-9 och bindestreck. Å/Ä -> a, Ö -> o. Format: `kliniknamn-stad`. | `lunds-naprapatklinik-lund` |
| `name` | String | Officiellt kliniknamn. | `Lunds Naprapatklinik` |
| `legal_name` | String | Registrerat företagsnamn hos Bolagsverket. | `Lunds Naprapatklinik AB` |
| `org_number` | String | Organisationsnummer format: `XXXXXX-XXXX`. | `556812-3456` |
| `f_skatt` | String | `Ja` eller `Nej`. | `Ja` |
| `region` | String | Standardiserad region-slug (gemener, se avsnitt 6). | `skane` |
| `city` | String | Stad / Tätort med korrekt svensk stavning. | `Lund` |
| `municipality` | String | Kommunnamn. | `Lunds kommun` |
| `neighborhood` | String | Område / Stadsdel (t.ex. Centrum, Västra Hamnen, Torpa). | `Centrum` |
| `street` | String | Gatuadress och gatunummer. | `Stora Södergatan 12` |
| `postal` | String | Postnummer (format `XXX XX`). | `222 23` |
| `address` | String | Komplett postadress: `Gata, Postnr Ort`. | `Stora Södergatan 12, 222 23 Lund` |
| `lat` | Float | WGS84 latitud (geokodad koordinat). | `55.7012` |
| `lng` | Float | WGS84 longitud (geokodad koordinat). | `13.1934` |
| `phone` | String | Telefonnummer i läsbart format. | `046-12 34 56` |
| `website` | String | Officiell webbplats (`https://...`). | `https://lundsnaprapat.se/` |
| `booking_url` | String | Direktlänk till onlinebokning. | `https://www.bokadirekt.se/places/lunds-naprapatklinik-12345` |
| `booking_platform` | String | `bokadirekt`, `kuralink`, `boka-online`, `egen` eller `annan`. | `bokadirekt` |
| `services` | String | Pipe-separerad lista: `naprapat\|kiropraktor\|massage\|fysioterapeut`. | `naprapat\|massage` |
| `has_naprapat` | Boolean | `true` om naprapati erbjuds, annars `false`. | `true` |
| `has_kiropraktor`| Boolean | `true` om kiropraktik erbjuds, annars `false`. | `false` |
| `has_massage` | Boolean | `true` om massage erbjuds, annars `false`. | `true` |
| `has_fysioterapeut`| Boolean| `true` om fysioterapi erbjuds, annars `false`. | `false` |
| `specialties` | String | Pipe-separerad lista med specialistområden. | `idrottsskador\|stötvågsbehandling\|dry needling` |
| `practitioners` | String | Semikolon-separerad lista: `Namn (Titel/Legitimation)`. | `Johan Svensson (Leg. Naprapat); Elin Lind (Cert. Massör)` |
| `rating` | Float | Genomsnittligt betyg (0.0–5.0) från Bokadirekt/Google. | `4.9` |
| `review_count` | Integer | Totalt antal recensioner. | `142` |
| `price_level` | Integer | 1 (Budget/Frikort: < 500 kr), 2 (Normal: 500–950 kr), 3 (Premium: > 950 kr). | `2` |
| `price_first_visit_sek`| Integer | Cirkapris i SEK för nybesök / första behandling. | `850` |
| `description` | String | Redaktionell sammanfattning (2–4 meningar) på neutral svenska. | `Etablerad naprapatklinik i centrala Lund med fokus på idrottsskador och ryggbesvär...` |
| `opening_hours_summary`| String | Sammanfattning av ordinarie öppettider. | `Mån–tors 07:30–18:00, fre 07:30–16:00, lör–sön stängt` |
| `hours_mon` ... `hours_sun` | String | Tider per dag t.ex. `08:00–17:00` eller `Stängt`. | `08:00–17:00` |
| `payment_methods`| String | Pipe-separerat: `kort\|swish\|friskvårdsbidrag\|klarna\|faktura`. | `kort\|swish\|friskvårdsbidrag` |
| `accessibility` | String | Pipe-separerat: `Hiss\|Rullstolsanpassad\|Parkering\|Nära kollektivtrafik`. | `Hiss\|Rullstolsanpassad` |
| `source_urls` | String | Pipe-separerad lista med URL:er där informationen kontrollerats. | `https://www.bokadirekt.se/...\|https://allabolag.se/...` |
| `last_verified_at`| Date | Dagens datum i format `YYYY-MM-DD`. | `2026-09-15` |
| `data_confidence`| String | `High - verifierad` eller `Medium`. | `High - verifierad` |

---

## 5. Kvalitetskrav & Valideringsregler

1. **Anti-dubblett-kontroll (Viktigt):**
   - Befintliga 500 kliniker på Nakima får inte dubbleras.
   - En klinik identifieras unikt genom `org_number` ELLER kombinationen av `city` + `street` + `telefon`.
   - Se till att inte skapa två poster för samma fysiska mottagning.
2. **Krav på Utövare / Behandlare (`practitioners`):**
   - Samla in individuella behandlarnamn där det finns tillgängligt (från Bokadirekt "Välj utövare", klinikens webbplats "Om oss / Personal", eller bolagsföreträdare).
   - Formatet SKA alltid vara: `Förnamn Efternamn (Legitimation/Titel)`.
   - Exempel: `Erik Lundqvist (Leg. Naprapat)`, `Sara Holm (Leg. Kiropraktor)`, `Martin Berg (Cert. Medicinsk Massageterapeut)`.
3. **Objektiv ton i beskrivningar (`description`):**
   - Skriv i tredje person med saklig, förtroendeingivande ton.
   - Undvik säljande klyschor som "Vi är bäst i stan". Beskriv istället inriktning, metoder (stötvåg, OMT, akupunktur, massage) och klinikens profil.
4. **Korrekt Region-slug (`region`):**
   Använd följande godkända region-sluggar:
   - `stockholm`, `goteborg`, `malmo`, `skane`, `uppsala`, `ostergotland`, `jonkoping`, `orebro`, `vastmanland`, `vasterbotten`, `halland`, `varmland`, `dalarna`, `gavleborg`, `vasternorrland`, `jamtland`, `kronoberg`, `kalmar`, `blekinge`, `sodermanland`, `norrbotten`, `gotland`.

---

## 6. Förväntad Leverans från HyperAgent

HyperAgent förväntas leverera:
1. `nakima-nya-kliniker-och-utovare.csv` (komplett masterfil med alla insamlade kliniker).
2. `nakima-nya-utovare-detaljerad.csv` (en rad per enskild utövare/behandlare med koppling till sin klinik).
3. `sammanfattningsrapport.md` som redogör för:
   - Totalt antal insamlade kliniker
   - Fördelning per region och stad
   - Fördelning per yrkeskategori (Naprapat, Kiropraktor, Fysioterapeut, Massage)
   - Antal unika namngivna utövare med legitimation/certifiering
   - Eventuella avvikelser eller poster som kräver manuell granskning.
