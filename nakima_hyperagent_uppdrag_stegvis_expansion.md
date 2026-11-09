# Uppdrag till HyperAgent: Stegvis Expansion och Förtätning av Kliniker för Nakima.se

**Mottagare:** HyperAgent (Autonomous Web Scraping & Research Agent)  
**Uppdragsgivare:** Nakima.se (Sveriges guide för manuell medicin och fysioterapi)  
**Mål:** Insamla, verifiera och berika 1 500–2 500 nya unika kliniker och behandlare i Sverige med **fullständiga kontaktuppgifter (inklusive e-post)**, genomfört i tre prioriterade etapper.

---

## 1. Bakgrund & Syfte

Nakima har idag 500 verifierade kliniker i 12 städer. En geografisk analys visar dock kraftig obalans:
1. **Stockholm och Göteborg är kritiskt undertäckta per capita** (0,49–0,68 kliniker per 10 000 invånare, jämfört med 2,6 i Borås och Umeå).
2. **Kranskommuner runt storstäderna saknas nästan helt** (över 750 000 invånare i Huddinge, Södertälje, Järfälla, Haninge, Partille etc. saknar listade kliniker).
3. **Stora städer saknas helt** (Lund med 130 000 inv, Halmstad, Kristianstad, Karlstad, Gävle etc.).

Detta uppdrag utförs därför i **tre steg**:
- **Steg 1 (Kritiskt):** Förtätning av Stockholm & Göteborg samt deras kranskommuner.
- **Steg 2 (Tunna områden):** Förtätning av Malmö, Uppsala samt åtgärda disciplinluckor (kiropraktik & fysioterapi).
- **Steg 3 (Bredare expansion):** Nya städer med start i Skåne och Västkusten, följt av Mellansverige och Norrland.

---

## 2. Arbetsordning i Tre Steg

### STEG 1: Kritiskt undertäckta områden (Högsta prioritet)

#### A. Storstockholm & Kranskommuner (Mål: +350–500 kliniker)
1. **Innerstaden och förorter:** Förtäta med särskilt fokus på **Kiropraktorer** (vi har bara 10 idag!) och **Fysioterapeuter**.
2. **Kranskommuner (Vita fläckar idag – 0 kliniker listade):**
   - **Söderort / Sydväst:** Huddinge, Södertälje, Botkyrka, Haninge, Tyresö
   - **Västerort / Nordväst:** Järfälla, Upplands Väsby, Sigtuna / Märsta, Danderyd
   - **Förtätning i befintliga kransar:** Nacka (har bara 4 idag), Sollentuna (har 2), Sundbyberg (har 4), Solna (har 8).

#### B. Storgöteborg & Kranskommuner (Mål: +150–250 kliniker)
1. **Göteborgs stad:** Förtäta Innerstaden och Hisingen (särskilt **Kiropraktorer** och **Naprapater**).
2. **Kranskommuner:**
   - Partille (0 kliniker idag), Härryda / Mölnlycke, Kungälv, Lerum, Kungsbacka, Mölndal, Alingsås.

---

### STEG 2: "Tunna" områden och disciplinluckor (Medelhög prioritet)

#### A. Uppsala (Mål: +40–60 kliniker)
- Sveriges 4:e största stad har idag bara 26 kliniker och **endast 4 fysioterapeuter**.
- Fyll på fysioterapeuter, kiropraktorer och naprapater i Uppsala samt Knivsta.

#### B. Malmö (Mål: +50–80 kliniker)
- Har idag endast 36 kliniker på 360 000 invånare och **endast 6 fysioterapeuter**.
- Förtäta innerstaden, Västra Hamnen, Limhamn, Hyllie och Fosie.

#### C. Disciplinfyllnad i befintliga städer (Mål: +50–100 kliniker)
- **Norrköping:** Fyll på naprapater (har bara 4 idag).
- **Borås:** Fyll på naprapater (har bara 5 idag).
- **Jönköping:** Fyll på kiropraktorer (har bara 3 idag).
- **Linköping & Örebro:** Förtäta manuell medicin och fysioterapi.

---

### STEG 3: Bred expansion – Nya städer (Normal prioritet)

#### A. Skåne (Mål: +120–180 kliniker)
- **Lund** (Högsta prio – universitetsstad med 130 000 inv, 0 kliniker idag)
- **Kristianstad**, **Landskrona**, **Trelleborg**, **Ängelholm**, **Ystad**, **Hässleholm**

#### B. Halland & Västkust (Mål: +100–150 kliniker)
- **Halmstad** (105 000 inv, 0 kliniker idag)
- **Varberg**, **Falkenberg**, **Trollhättan**, **Uddevalla**, **Skövde**

#### C. Mellansverige, Småland & Norrland (Mål: +150–250 kliniker)
- **Mellansverige:** Eskilstuna, Gävle, Karlstad, Falun, Borlänge, Nyköping
- **Småland / Sydost:** Växjö, Kalmar, Karlskrona
- **Norrland:** Sundsvall, Luleå, Östersund, Skellefteå

---

## 3. Dubblettkontroll (Kritiskt)

Innan en klinik sparas måste HyperAgent kontrollera mot Nakimas befintliga register i **`befintliga-kliniker-referens.json`** eller **`nakima-alla-kliniker-och-utovare.csv`**.
- Matcha mot `slug`, `namn` + `stad`, eller `gatuadress`.
- Om kliniken redan finns: **Hoppa över**. Endast nya mottagningar ska ingå i leveransen.

---

## 4. Officiella Källor

1. **Bokadirekt.se:** Sök på ort/kommun och kategorierna *Naprapat*, *Kiropraktor*, *Massage*, *Fysioterapeut / Sjukgymnast*. Hämta bokningslänk, behandlarnamn, betyg, priser och kontaktdata.
2. **Yrkesförbundens Medlemsregister:**
   - Svenska Naprapatförbundet (`naprapater.se/hitta-naprapat/`)
   - Legitimerade Kiropraktorers Riksorganisation (`lkr.se/hitta-kiropraktor/` och `kiropraktik.se`)
   - Fysioterapeuterna (`fysioterapeuterna.se`)
   - Kroppsterapeuternas Yrkesförbund (`kroppsterapeuterna.se`)
3. **Offentlig Vård (1177.se):** Privata mottagningar med regionavtal/frikort inom fysioterapi och manuell medicin.
4. **Allabolag.se / Ratsit.se:** För att verifiera `organisationsnummer`, `juridiskt_namn` och aktiv `f_skatt`.

---

## 5. Krav på Datastruktur (CSV & JSON)

Varje klinik ska ha följande kolumner:

| Kolumn | Beskrivning | Exempel |
| :--- | :--- | :--- |
| `slug` | Kebab-case id: `kliniknamn-stad` | `huddinge-naprapatklinik-huddinge` |
| `namn` | Officiellt kliniknamn | `Huddinge Naprapatklinik` |
| `juridiskt_namn` | Registrerat bolagsnamn | `Huddinge Naprapati AB` |
| `organisationsnummer`| Bolagets org.nr (`XXXXXX-XXXX`) | `556912-3456` |
| `f_skatt` | `Ja` eller `Nej` | `Ja` |
| `region` | Standardiserad region-slug | `stockholm`, `goteborg`, `skane`, etc. |
| `stad` | Stad / Tätort / Kommun | `Huddinge` |
| `kommun` | Kommunnamn | `Huddinge kommun` |
| `stadsdel` | Område / Stadsdel | `Centrum` / `Sjödalen` |
| `gatuadress` | Gatuadress och nummer | `Forelltorget 2` |
| `postnummer` | Format `XXX XX` | `141 47` |
| `adress` | Komplett adress | `Forelltorget 2, 141 47 Huddinge` |
| `latitud` | WGS84 latitud (decimal) | `59.2365` |
| `longitud` | WGS84 longitud (decimal) | `17.9821` |
| `telefon` | Telefonnummer | `08-711 XX XX` |
| **`epost`** | **Obligatoriskt: Officiellt kontaktmejl** | `info@huddingenaprapat.se` |
| `webbplats` | Officiell webbadress | `https://huddingenaprapat.se` |
| `bokningsurl` | Direktlänk till onlinebokning | `https://www.bokadirekt.se/places/...` |
| `bokningsplattform` | `bokadirekt`, `timecenter`, `egen` etc. | `bokadirekt` |
| `tjanster` | Tjänster: `naprapat\|massage` etc. | `naprapat\|massage` |
| `har_naprapat` | `true` eller `false` | `true` |
| `har_kiropraktor`| `true` eller `false` | `false` |
| `har_massage` | `true` eller `false` | `true` |
| `har_fysioterapeut`| `true` eller `false` | `false` |
| `specialiteter` | T.ex. `idrottsskador\|stötvåg` | `idrottsskador\|ryggsmärta` |
| `antal_utovare` | Siffra | `2` |
| `utovare` | `Namn (Titel); Namn (Titel)` | `Erik Lind (Leg. Naprapat)` |
| `betyg` | Betyg (0.0–5.0) | `4.9` |
| `antal_recensioner`| Antal recensioner | `42` |
| `prisniva` | 1, 2 eller 3 | `2` |
| `pris_forsta_besok_sek` | Pris i kr | `820` |
| `beskrivning` | Beskrivande ingress om kliniken | Redaktionell profiltext |
| `kallor` | URL till källor | `bokadirekt.se; allabolag.se` |
| `senast_verifierad` | Dagens datum (`YYYY-MM-DD`) | `2026-11-09` |

---

## 6. Leveransformat

Leverera resultatet som:
1. **`nakima-nya-kliniker-expansion.csv`** (UTF-8 med BOM, semikolon- eller komma-separerad med citattecken runt textfält).
2. **`nakima-nya-kliniker-expansion.json`** (Strukturerad JSON-array).
