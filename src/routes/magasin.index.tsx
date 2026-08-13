import { createFileRoute, Link } from "@tanstack/react-router";
import { articles } from "@/lib/articles-data";

export const Route = createFileRoute("/magasin/")({
  component: MagasinIndex,
  head: () => ({
    meta: [
      { title: "Magasinet – Nakima" },
      {
        name: "description",
        content: "Djuplodande hälsojournalistik och expertartiklar om ryggskott, ergonomi, priser för naprapater och mycket mer.",
      },
      { property: "og:title", content: "Magasinet – Nakima" },
      {
        property: "og:description",
        content: "Djuplodande hälsojournalistik och expertartiklar om ryggskott, ergonomi, priser för naprapater och mycket mer.",
      },
    ],
    links: [{ rel: "canonical", href: "/magasin" }],
  }),
});

function MagasinIndex() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          Nakima<span className="text-orange">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest">
          <Link to="/magasin" className="text-orange transition-colors">Magasin</Link>
          <a href="/#stader" className="hover:text-orange transition-colors">Sök klinik</a>
          <span className="text-ink/50 cursor-default" title="Kommer snart">För kliniker</span>
        </div>
        <span className="px-6 py-2 border border-ink/40 text-ink/60 text-xs font-bold uppercase tracking-widest cursor-default" title="Kommer snart">
          Logga in
        </span>
      </nav>

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <span className="inline-block bg-sage text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-6">
          Kunskap & Guide
        </span>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
          Nakima Magasin
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">
          Vi förenar expertis inom manuell medicin med djuplodande hälsojournalistik för att hjälpa dig förstå din kropp och hitta rätt behandling.
        </p>
      </header>

      {/* Article Grid */}
      <section className="bg-sage py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((a) => (
              <Link 
                to="/magasin/$slug" 
                params={{ slug: a.slug }} 
                key={a.slug} 
                className="group block"
              >
                <article>
                  <div className="w-full aspect-[16/10] mb-6 overflow-hidden bg-card">
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      width={1024}
                      height={640}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange block mb-3">
                    {a.tag}
                  </span>
                  <h3 className="text-xl font-serif mb-3 text-ink group-hover:text-orange transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed mb-4">{a.excerpt}</p>
                  <span className="inline-block text-xs font-bold uppercase tracking-widest border-b border-ink/40 pb-1 text-ink group-hover:border-orange group-hover:text-orange transition-colors">
                    Läs artikel →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
