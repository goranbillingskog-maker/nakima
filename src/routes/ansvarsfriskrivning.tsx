import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ansvarsfriskrivning")({
  component: AnsvarsfriskrivningPage,
  head: () => ({
    meta: [
      { title: "Ansvarsfriskrivning | Nakima" },
      {
        name: "description",
        content: "Ansvarsfriskrivning och villkor för användning av Nakimas redaktionella guider och klinikkatalog.",
      },
    ],
    links: [{ rel: "canonical", href: "/ansvarsfriskrivning" }],
  }),
});

function AnsvarsfriskrivningPage() {
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
          Ansvarsfriskrivning
        </h1>
        <p className="text-xs uppercase tracking-widest text-ink-soft mb-12">
          Senast uppdaterad: 13 augusti 2026
        </p>

        <div className="prose prose-ink max-w-none space-y-8 text-ink-soft leading-relaxed">
          <p>
            Nakima är en redaktionell guide och katalogtjänst för naprapater, kiropraktorer och massörer i Sverige. Vi vill vara tydliga med vad vi ansvarar för — och inte.
          </p>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Klinikinformation</h2>
            <p>
              Uppgifter om kliniker (adress, öppettider, priser, tjänster) samlas in redaktionellt och uppdateras löpande, men kan ändras utan att vi hinner uppdatera i tid. Kontrollera alltid aktuell information direkt med kliniken innan du bokar tid.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Legitimation</h2>
            <p>
              Vi anger när en klinik uppges drivas av personal legitimerad hos Socialstyrelsen, men Nakima utför ingen fortlöpande kontroll av enskilda behandlares legitimationsstatus. Du kan själv verifiera legitimation via Socialstyrelsens register (HOSP).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Bokning hos tredje part</h2>
            <p>
              Bokning sker ofta via klinikens eller en tredje parts bokningssystem (t.ex. Bokadirekt). Nakima är inte part i avtalet mellan dig och kliniken och ansvarar inte för bokning, betalning, avbokning eller kvaliteten på given behandling.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Redaktionellt innehåll (magasinet)</h2>
            <p>
              Artiklarna i Nakimas magasin är allmän information framtagen redaktionellt och ersätter inte medicinsk, juridisk eller ekonomisk rådgivning. Se separat innehållsdisclaimer på respektive artikel.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink mb-3">Ansvarsbegränsning</h2>
            <p>
              Nakima lämnas i befintligt skick ("as is"). I den utsträckning lagen tillåter ansvarar Nakima inte för direkta eller indirekta skador som uppstår genom användning av tjänsten, inklusive men inte begränsat till felaktig klinikinformation, uteblivna bokningar eller beslut fattade baserat på det redaktionella innehållet.
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
