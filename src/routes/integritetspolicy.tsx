import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/integritetspolicy")({
  component: IntegritetspolicyPage,
  head: () => ({
    meta: [
      { title: "Integritetspolicy | Nakima" },
      {
        name: "description",
        content: "Integritetspolicy och information om hur vi hanterar dina personuppgifter på Nakima.",
      },
    ],
    links: [{ rel: "canonical", href: "/integritetspolicy" }],
  }),
});

function IntegritetspolicyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          Nakima<span className="text-orange">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest">
          <Link to="/magasin" className="hover:text-orange transition-colors">Magasin</Link>
          <a href="/#stader" className="hover:text-orange transition-colors">Sök klinik</a>
          <span className="text-ink/50 cursor-default" title="Kommer snart">För kliniker</span>
        </div>
        <span className="px-6 py-2 border border-ink/40 text-ink/60 text-xs font-bold uppercase tracking-widest cursor-default" title="Kommer snart">
          Logga in
        </span>
      </nav>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">
          Integritetspolicy
        </h1>
        <p className="text-xs uppercase tracking-widest text-ink-soft mb-12">
          Senast uppdaterad: 13 augusti 2026
        </p>

        <div className="prose prose-ink max-w-none space-y-8 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Vem är personuppgiftsansvarig?</h2>
            <p>
              Billingskog (Nakima), med e-postadress info@nakima.se, är personuppgiftsansvarig för behandlingen av personuppgifter som beskrivs nedan. Kontakta oss på info@nakima.se vid frågor.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Vilka uppgifter samlar vi in?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Platsdata:</strong> Om du använder funktionen "Använd min plats" hämtar vi din ungefärliga geografiska position via webbläsaren för att visa kliniker nära dig. Denna uppgift används endast under sessionen och sparas inte permanent på våra servrar.
              </li>
              <li>
                <strong>Sökuppgifter:</strong> Val av tjänst (naprapat/kiropraktor/massage), stad och stadsdel du söker på.
              </li>
              <li>
                <strong>Tekniska uppgifter:</strong> IP-adress, webbläsartyp och liknande, insamlat automatiskt av vår hosting-leverantör och eventuella analysverktyg.
              </li>
              <li>
                <strong>Kontaktuppgifter:</strong> Om du kontaktar oss via e-post eller formulär sparar vi det du själv lämnar (namn, e-post, meddelande).
              </li>
              <li>
                <strong>Uppgifter från kliniker:</strong> Om du är klinikrepresentant och registrerar din klinik hos oss sparar vi de uppgifter ni lämnar (företagsnamn, kontaktperson, adress, m.m.).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Varför behandlar vi uppgifterna? (rättslig grund)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>För att tillhandahålla tjänsten (visa relevanta kliniker) — <strong>berättigat intresse / avtal</strong>.</li>
              <li>För att förbättra sajten (statistik/analys) — <strong>berättigat intresse</strong>.</li>
              <li>För att svara på kontaktförfrågningar — <strong>berättigat intresse / avtal</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Delas uppgifter med tredje part?</h2>
            <p>
              Vi delar inte dina uppgifter i reklamsyfte. Observera att bokning av tid sker via klinikens eller tredje parts bokningssystem (t.ex. Bokadirekt) — dessa tjänster har egna integritetspolicyer som gäller för uppgifter du lämnar där.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Cookies</h2>
            <p>
              Vi använder nödvändiga cookies för att webbplatsen ska fungera optimalt. Om vi implementerar analys- eller marknadsföringscookies som kräver samtycke, kommer vi att inhämta detta via en cookie-banner innan de placeras i din webbläsare.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Hur länge sparar vi uppgifter?</h2>
            <p>
              Vi sparar endast dina personuppgifter så länge de är nödvändiga för de ändamål de samlades in för, exempelvis för att besvara en förfrågan eller upprätthålla din kliniks registrering i vårt register.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Dina rättigheter</h2>
            <p>
              Du har rätt att begära tillgång till, rättelse av eller radering av dina personuppgifter, samt att invända mot viss behandling. Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY) via <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange">imy.se</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Kontakt</h2>
            <p>
              Vid frågor om hur vi hanterar dina personuppgifter, vänligen kontakta oss på: <a href="mailto:info@nakima.se" className="underline hover:text-orange">info@nakima.se</a>.
            </p>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer id="for-kliniker" className="bg-ink text-paper pt-20 pb-12 mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="text-2xl font-serif font-bold tracking-tight mb-6">
                Nakima<span className="text-orange">.</span>
              </div>
              <p className="text-sage/70 text-sm max-w-sm leading-relaxed">
                Sveriges redaktionella portal för manuell medicin. Vi gör det enkelt att hitta
                trygg och professionell vård – och att förstå vad du får hjälp med.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-orange">
                Tjänster
              </h4>
              <ul className="space-y-3 text-sm text-sage/80">
                <li><Link to="/$service/$city" params={{ service: "naprapat", city: "stockholm" }} className="hover:text-paper transition-colors">Hitta naprapat</Link></li>
                <li><Link to="/$service/$city" params={{ service: "kiropraktor", city: "stockholm" }} className="hover:text-paper transition-colors">Hitta kiropraktor</Link></li>
                <li><Link to="/$service/$city" params={{ service: "massage", city: "stockholm" }} className="hover:text-paper transition-colors">Hitta massör</Link></li>
                <li><span className="opacity-60 cursor-default" title="Kommer snart">För kliniker</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-orange">
                Information
              </h4>
              <ul className="space-y-3 text-sm text-sage/80">
                <li><span className="opacity-60 cursor-default" title="Kommer snart">Om Nakima</span></li>
                <li><span className="opacity-60 cursor-default" title="Kommer snart">Kontakta oss</span></li>
                <li><span className="opacity-60 cursor-default" title="Kommer snart">Integritetspolicy</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-sage/50">
              © 2026 Nakima Health Magazine
            </p>
            <div className="flex gap-6 text-[10px] uppercase tracking-widest text-sage/50">
              <span className="cursor-default" title="Kommer snart">Instagram</span>
              <span className="cursor-default" title="Kommer snart">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
