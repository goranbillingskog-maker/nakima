import articleNacke from "@/assets/article-nacke.jpg";
import articleRygg from "@/assets/article-rygg.jpg";
import articlePris from "@/assets/article-pris.jpg";

export interface ArticleFaq {
  q: string;
  a: string;
}

export interface ArticleContentSection {
  type: "p" | "h2" | "list" | "cta";
  text?: string;
  items?: string[];
}

export interface Article {
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  image: string;
  byline: string;
  datePublished: string;
  metaTitle: string;
  metaDescription: string;
  faqs: ArticleFaq[];
  content: ArticleContentSection[];
}

export const articles: Article[] = [
  {
    slug: "darfor-far-vi-nacksmarta-av-kontorsarbete",
    title: "Därför får vi nacksmärta av kontorsarbete",
    tag: "Ergonomi",
    excerpt: "Två av tre får ont i nacken någon gång i livet — kontorsarbetare löper extra hög risk. Här är orsakerna och 5 experttips som faktiskt hjälper.",
    image: articleNacke,
    byline: "Nakima redaktionen",
    datePublished: "2026-08-13",
    metaTitle: "Därför får vi nacksmärta av kontorsarbete | Nakima",
    metaDescription: "Två av tre får ont i nacken någon gång i livet — kontorsarbetare löper extra hög risk. Här är orsakerna och 5 experttips som faktiskt hjälper.",
    faqs: [
      {
        q: "Hur vanligt är det med nacksmärta hos kontorsarbetare?",
        a: "Mycket vanligt — ungefär två av tre personer får ont i nacken någon gång i livet, och kontorsarbetare är en av grupperna med högst andel återkommande besvär, kopplat till långvarigt stillasittande framför skärm."
      },
      {
        q: "Räcker det med en ergonomisk stol för att bli av med nacksmärtan?",
        a: "Sällan på egen hand. En bra stol hjälper, men skärmhöjd, pausvanor och regelbunden rörelse spelar minst lika stor roll. Det är helheten som avgör."
      },
      {
        q: "Kan stress orsaka nacksmärta även utan dålig ergonomi?",
        a: "Ja. Nack- och axelmuskulaturen reagerar starkt på psykisk belastning, och många spänner axlarna omedvetet under stressiga perioder — det kan ge ont i nacken även vid i övrigt bra arbetsställning."
      },
      {
        q: "När ska jag söka professionell hjälp för nacksmärta?",
        a: "Om besvären kvarstår i flera veckor trots ergonomiska förbättringar, om smärtan strålar ut i armen, eller om den påverkar sömn och vardag, är det läge att boka tid hos en naprapat, kiropraktor eller fysioterapeut."
      }
    ],
    content: [
      {
        type: "p",
        text: "Nästan alla känner igen känslan: axlarna kryper upp mot öronen, nacken känns stel efter en dag framför skärmen, och på kvällen värker det upp mot huvudet. Det är ingen slump. Två av tre personer får ont i nacken någon gång i livet, och kontorsarbetare tillhör de yrkesgrupper som drabbas mest — i en svensk undersökning bland över 1 200 kontorsarbetare uppgav en av tio att de har återkommande besvär i nackområdet."
      },
      {
        type: "p",
        text: "Den goda nyheten är att nacksmärta från kontorsarbete oftast går att förebygga. Det handlar sällan om en enskild \"fel\" rörelse, utan om summan av många timmars statisk belastning i fel position — dag efter dag."
      },
      {
        type: "h2",
        text: "Varför nacken tar stryk vid skrivbordsarbete"
      },
      {
        type: "p",
        text: "Nacken är byggd för rörelse, inte för att hållas stilla i en och samma vinkel i timmar. När du sitter med huvudet framåtlutat — vilket är precis vad som händer när skärmen står för lågt eller för nära — mångdubblas belastningen på nack- och skuldermuskulaturen jämfört med när huvudet vilar i neutralt läge rakt över axlarna. Musklerna i nacke och övre rygg jobbar hela tiden för att hindra huvudet från att \"falla\" framåt, och det är den ständiga, statiska spänningen som gör ont."
      },
      {
        type: "p",
        text: "Lägg till en stol utan ordentligt ländryggsstöd, ett tangentbord som tvingar axlarna uppåt, och långa perioder utan paus — så har du receptet på den klassiska kontorsnacken, ibland kallad \"gamnacke\"."
      },
      {
        type: "h2",
        text: "De vanligaste orsakerna"
      },
      {
        type: "list",
        items: [
          "Skärmens placering. Om skärmens överkant inte är i ögonhöjd tvingas du böja eller sträcka nacken under hela arbetsdagen.",
          "Fel stolsinställning. Utan stöd för ländryggen och med fel armstödshöjd kompenserar nacke och axlar för resten av kroppen.",
          "För få pauser. Musklerna i nacken behöver återhämtning. Sitter du stilla i timmar utan att röra dig byggs spänningen på utan avbrott.",
          "Stress. Nack- och axelmuskulaturen är särskilt känslig för psykisk belastning — många spänner axlarna omedvetet vid tidspress eller stress, vilket förstärker besvären.",
          "Ensidig arbetsställning. Att sitta i exakt samma position hela dagen, utan variation, ger musklerna ingen chans att vila."
        ]
      },
      {
        type: "h2",
        text: "Expertens 5 bästa tips för att undvika kontorsnacke"
      },
      {
        type: "p",
        text: "1. Ställ in skärmen rätt. Skärmens överkant ska vara i ögonhöjd och skärmen på ungefär en armlängds avstånd. Använder du laptop utan höjdbart stativ — höj den med böcker eller en laptopstand och koppla in externt tangentbord och mus."
      },
      {
        type: "p",
        text: "2. Justera stolen ordentligt. Sitt med fötterna platt mot golvet och knäna i ungefär 90 graders vinkel. Ryggstödet ska stödja ländryggen, och armstöden ska vara i höjd med skrivbordet så att axlarna kan vila avslappnat."
      },
      {
        type: "p",
        text: "3. Ta mikropauser var 30:e minut. Res dig, sträck på dig eller rulla axlarna bakåt några gånger. Var 90:e minut — ta en lite längre paus och rör dig gärna utomhus. En enkel påminnelse i telefonen eller en app räcker långt."
      },
      {
        type: "p",
        text: "4. Variera arbetsställningen. Växla mellan sittande och stående om du har ett höj- och sänkbart skrivbord, och byt gärna position under dagen — kroppen mår bäst av rörelse, inte av en \"perfekt\" stillasittande position."
      },
      {
        type: "p",
        text: "5. Rör på nacken aktivt. Enkla rörelseövningar — långsamma vridningar åt sidorna, hakan mot bröstet, försiktig sträckning bakåt — några gånger om dagen håller musklerna smidiga och motverkar stelhet innan den hinner bli kronisk."
      },
      {
        type: "h2",
        text: "När bör du söka hjälp?"
      },
      {
        type: "p",
        text: "De flesta nackbesvär från kontorsarbete lindras med bättre ergonomi, rörelse och pauser inom några veckor. Men om smärtan är ihållande, sprider sig ner i armen, ger huvudvärk varje dag eller inte förbättras trots att du ändrat vanorna, kan det vara läge att låta en naprapat, kiropraktor eller fysioterapeut undersöka nacken. De kan identifiera vad som specifikt belastar just din nacke och ge en individanpassad behandlings- och träningsplan."
      },
      {
        type: "cta",
        text: "Hitta naprapat eller kiropraktor nära dig →"
      }
    ]
  },
  {
    slug: "ryggskott-nar-ska-man-soka-hjalp",
    title: "Ryggskott: När ska man söka hjälp?",
    tag: "Behandling",
    excerpt: "De flesta ryggskott går över av sig själva — men vissa symtom är akuta varningstecken. Här är skillnaden mellan vanlig stelhet och allvarlig lumbago.",
    image: articleRygg,
    byline: "Nakima redaktionen",
    datePublished: "2026-08-13",
    metaTitle: "Ryggskott: När ska man söka hjälp? | Nakima",
    metaDescription: "De flesta ryggskott går över av sig själva — men vissa symtom är akuta varningstecken. Här är skillnaden mellan vanlig stelhet och allvarlig lumbago.",
    faqs: [
      {
        q: "Hur länge brukar ett ryggskott vara?",
        a: "De flesta ryggskott klingar av inom några dagar till två veckor. Om smärtan inte förbättras inom två till tre veckor rekommenderar 1177 Vårdguiden att du kontaktar en vårdcentral."
      },
      {
        q: "Ska jag ligga still eller röra på mig vid ryggskott?",
        a: "Lätt rörelse rekommenderas framför stillaliggande. Undvik tunga lyft och vridningar i akutskedet, men försök röra dig försiktigt, till exempel med korta promenader, så snart smärtan tillåter."
      },
      {
        q: "Vilka symtom betyder att jag måste söka akut vård?",
        a: "Domningar kring ändtarm/underliv, svårighet att känna eller hålla tätt för urin/avföring, eller domningar och svaghet i båda benen samtidigt. Dessa är tecken på cauda equina-syndrom och kräver akut vård samma dag."
      },
      {
        q: "Kan en naprapat eller kiropraktor hjälpa vid ryggskott?",
        a: "Ja, utanför de akuta varningstecknen kan de lindra smärta, hjälpa dig röra dig tryggt igen och ge råd för att minska risken för återfall."
      }
    ],
    content: [
      {
        type: "p",
        text: "Ryggskott — eller akut lumbago, som det heter medicinskt — är en av de vanligaste anledningarna till att människor plötsligt inte kan resa sig ur sängen på morgonen. Smärtan kommer ofta blixtsnabbt, ibland vid en helt vardaglig rörelse som att lyfta en kasse eller vrida sig fel, och kan kännas skrämmande intensiv. Den vanligaste frågan hos den som drabbas är enkel: är det här farligt, och behöver jag söka vård nu?"
      },
      {
        type: "p",
        text: "Svaret är i de allra flesta fall lugnande. Men det finns ett fåtal symtom som alltid ska tas på allvar och föranleda akut vård samma dag. Här reder vi ut skillnaden."
      },
      {
        type: "h2",
        text: "Vad är egentligen ett ryggskott?"
      },
      {
        type: "p",
        text: "Ryggskott är en plötsligt uppkommen, ofta mycket kraftig smärta i ländryggen, vanligen orsakad av att muskler, leder eller diskar i nedre delen av ryggen blir överbelastade eller irriterade. Det är inte samma sak som ett allvarligt \"diskbråck med nervpåverkan\", även om det ibland kan kännas likadant i det akuta skedet. Smärtan sitter oftast lokalt i ländryggen, kan göra att du låser dig i en sned position, och förvärras ofta av rörelse, hosta eller nysning."
      },
      {
        type: "h2",
        text: "Vanlig stelhet eller ryggskott — vad är skillnaden?"
      },
      {
        type: "p",
        text: "Vanlig muskelstelhet efter till exempel ett tungt träningspass eller en obekväm sovställning kommer oftast gradvis, känns diffust över ett större område och lättar successivt inom ett par dagar med rörelse och värme."
      },
      {
        type: "p",
        text: "Ett ryggskott skiljer sig genom att smärtan kommer plötsligt och intensivt — ofta mitt i en rörelse — och kan göra det svårt att röra sig alls i det akuta skedet. Det är den snabba starten och intensiteten, snarare än var i ryggen det gör ont, som brukar särskilja ett riktigt ryggskott från vanlig träningsvärk eller stelhet."
      },
      {
        type: "h2",
        text: "Det normala förloppet — och när du inte behöver oroa dig"
      },
      {
        type: "p",
        text: "För de allra flesta är ett ryggskott obehagligt men ofarligt. Det brukar klinga av gradvis inom några dagar till ett par veckor, och det är i regel inte nödvändigt att söka vård direkt — kroppen läker som huvudregel av sig själv. Enligt 1177 Vårdguiden bör du kontakta en vårdcentral om smärtan inte har förbättrats inom två till tre veckor, eller om den återkommer ofta."
      },
      {
        type: "p",
        text: "Under den akuta fasen är lätt rörelse — inte stillaliggande — det som rekommenderas. Undvik tunga lyft och vridande rörelser, men försök röra dig försiktigt så snart det går, gärna med korta promenader."
      },
      {
        type: "h2",
        text: "Varningstecken — när du ska söka akut vård omedelbart"
      },
      {
        type: "p",
        text: "Ett litet fåtal fall av svår ländryggssmärta beror på att något trycker på nervrötterna längst ner i ryggmärgen, ett tillstånd som kallas cauda equina-syndrom. Det kräver akut behandling. Sök vård samma dag — helst akutmottagning — om du får något av följande tillsammans med ryggsmärtan:"
      },
      {
        type: "list",
        items: [
          "Domningar eller nedsatt känsel kring ändtarmen, könsorganen eller insidan av låren (\"sadelanestesi\")",
          "Svårt att känna när du behöver kissa, eller att du plötsligt inte kan hålla tätt för urin eller avföring",
          "Domningar, stickningar eller påtaglig svaghet i båda benen samtidigt",
          "Snabbt tilltagande förlamningskänsla"
        ]
      },
      {
        type: "p",
        text: "Dessa symtom ska aldrig vänta till nästa dag. Sök akut vård direkt om något av ovanstående inträffar."
      },
      {
        type: "h2",
        text: "Vad kan hjälpa vid ett vanligt ryggskott?"
      },
      {
        type: "p",
        text: "Utanför de akuta varningstecknen ovan kan naprapater och kiropraktorer vara till stor hjälp för att lindra smärtan snabbare och komma igång med rörelse tryggt. Behandlingen kan innefatta mjukdelsbehandling, försiktig mobilisering och individuella råd om vilka rörelser som är säkra i just ditt skede av läkningen — samt ett upplägg för att minska risken att det händer igen."
      },
      {
        type: "cta",
        text: "Hitta naprapat eller kiropraktor nära dig →"
      }
    ]
  },
  {
    slug: "vad-kostar-en-naprapat-2026",
    title: "Vad kostar en naprapat 2026?",
    tag: "Patientguide",
    excerpt: "Prisguide 2026: vad kostar första besöket och uppföljning hos naprapat, vad gäller för friskvårdsbidrag och försäkring — och vad påverkar priset.",
    image: articlePris,
    byline: "Nakima redaktionen",
    datePublished: "2026-08-13",
    metaTitle: "Vad kostar en naprapat 2026? | Nakima",
    metaDescription: "Prisguide 2026: vad kostar första besöket och uppföljning hos naprapat, vad gäller för friskvårdsbidrag och försäkring — och vad påverkar priset.",
    faqs: [
      {
        q: "Vad kostar ett första besök hos en naprapat 2026?",
        a: "Typiskt 600–900 kr, beroende på klinik, stad och prisnivå. Första besöket är ofta längre och något dyrare än uppföljande behandlingar."
      },
      {
        q: "Kan jag använda friskvårdsbidraget hos en naprapat?",
        a: "Ibland. Om behandlingen sker i förebyggande/underhållande syfte kan den räknas som friskvård. Behandling av en specifik skada eller diagnos räknas däremot som sjukvård och omfattas normalt inte. Kontrollera med din arbetsgivare och kliniken."
      },
      {
        q: "Är naprapatbehandling dyrare än kiropraktik?",
        a: "Prisnivåerna överlappar generellt — båda ligger oftast i samma spann (550–900 kr per besök). Skillnaden i pris beror mer på klinikens läge och utrustning än på behandlingsform."
      },
      {
        q: "Varför kostar första besöket mer än uppföljningar?",
        a: "Första besöket innefattar en grundligare genomgång — anamnes och fysisk undersökning — utöver själva behandlingen, vilket gör det längre och därför något dyrare."
      }
    ],
    content: [
      {
        type: "p",
        text: "Priset hos en naprapat varierar mer än många tror — mellan olika kliniker, städer och beroende på om det är ditt första besök eller en uppföljning. Här går vi igenom vad du kan förvänta dig att betala 2026, vad som faktiskt gäller för friskvårdsbidraget, och vilka faktorer som påverkar slutpriset."
      },
      {
        type: "h2",
        text: "Vad kostar ett besök?"
      },
      {
        type: "p",
        text: "Baserat på Nakimas granskning av naprapatkliniker i Stockholm och Göteborg ligger priserna generellt inom följande spann:"
      },
      {
        type: "list",
        items: [
          "Första besöket: cirka 600–900 kr. Förstabesöket är ofta längre (45–60 minuter) eftersom det innefattar anamnes, undersökning och ofta även behandling, vilket förklarar det något högre priset.",
          "Uppföljande behandling: cirka 550–800 kr, beroende på klinikens prisnivå och stad."
        ]
      },
      {
        type: "p",
        text: "Kliniker vi granskat delar vi in i tre prisnivåer — Budget, Standard och Premium — där de flesta ligger i mellanskiktet. Kliniker i mer centrala lägen, eller med särskild specialistutrustning som stötvågsbehandling eller diagnostiskt ultraljud, tenderar att ligga i det övre spannet."
      },
      {
        type: "h2",
        text: "Vad påverkar priset?"
      },
      {
        type: "list",
        items: [
          "Läge. Kliniker i storstadscentrum och särskilt attraktiva områden har ofta något högre priser än förortskliniker.",
          "Utrustning och specialisering. Kliniker med avancerad diagnostik (ultraljud, stötvåg) eller nischad specialistkompetens tar oftast mer betalt.",
          "Besökstyp. Första besök kostar generellt mer än uppföljningar eftersom det tar längre tid.",
          "Kombinationsbehandlingar. Massage, dry needling eller akupunktur i samma besök påverkar priset."
        ]
      },
      {
        type: "h2",
        text: "Vad gäller för friskvårdsbidrag?"
      },
      {
        type: "p",
        text: "Det här är en av de vanligaste frågorna — och svaret är mer nyanserat än många tror. Enligt Skatteverkets regler för 2026 är gränsen för skattefritt friskvårdsbidrag 5 000 kr per anställd och år, men inte all behandling hos naprapat eller kiropraktor räknas som friskvård:"
      },
      {
        type: "list",
        items: [
          "Behandling som syftar till att behandla en skada, ett sjukdomstillstånd eller smärta klassas som hälso- och sjukvård — och räknas då inte som friskvård enligt Skatteverket.",
          "Behandling i förebyggande eller underhållande syfte, för att må bra och bibehålla funktion snarare än att behandla en specifik diagnos, kan däremot räknas som friskvård och omfattas av bidraget.",
          "Kiropraktik räknas generellt som hälso- och sjukvård (och är momsbefriad), vilket gör det svårare att använda friskvårdsbidraget där — men kontorsmassage och liknande generell mjukdelsbehandling som erbjuds hela personalen kan vara skattefri friskvård."
        ]
      },
      {
        type: "p",
        text: "Gränsdragningen görs i praktiken av arbetsgivaren och i sista hand av Skatteverket, så kontrollera alltid med din arbetsgivare och gärna med kliniken innan du bokar, om du planerar att använda friskvårdsbidraget."
      },
      {
        type: "h2",
        text: "Kan försäkring täcka besöket?"
      },
      {
        type: "p",
        text: "Har du en privat sjukvårdsförsäkring genom arbetsgivaren eller privat kan naprapatbehandling ofta ersättas helt eller delvis, särskilt om du blivit hänvisad via försäkringsbolagets vårdplanering. Kontrollera villkoren i din specifika försäkring — självrisk och krav på remiss varierar mellan bolag."
      },
      {
        type: "h2",
        text: "Så hittar du rätt pris för dig"
      },
      {
        type: "p",
        text: "Det enklaste sättet att jämföra är att titta på klinikens prisnivå-markering och kontakta kliniken direkt för aktuell prislista, eftersom priser uppdateras löpande. I Nakimas klinikkatalog ser du prisnivå, betyg och kontaktuppgifter för varje granskad klinik i din stad."
      },
      {
        type: "cta",
        text: "Jämför naprapatkliniker och priser i din stad →"
      }
    ]
  }
];
