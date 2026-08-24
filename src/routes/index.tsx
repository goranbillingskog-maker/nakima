import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import heroClinic from "@/assets/hero-clinic.jpg";
import { cities as allCities, getCityClinicCount } from "@/lib/clinics-data";
import { articles } from "@/lib/articles-data";

import { fetchCityClinicCount } from "@/lib/db";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const counts = await Promise.all(
        allCities.map(async (c) => {
          try {
            const count = await fetchCityClinicCount(c.slug);
            return { slug: c.slug, count };
          } catch (e) {
            console.error(`Failed to fetch count for ${c.slug}:`, e);
            return { slug: c.slug, count: 0 };
          }
        })
      );
      return {
        counts: Object.fromEntries(counts.map((x) => [x.slug, x.count])),
      };
    } catch (e) {
      console.error("Failed to load city clinic counts:", e);
      return { counts: {} as Record<string, number> };
    }
  },
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [service, setService] = useState("naprapat");
  const [cityInput, setCityInput] = useState("");
  const { counts } = Route.useLoaderData();

  const cities = allCities.map((c) => {
    const dbCount = counts[c.slug] ?? 0;
    const staticCount = getCityClinicCount(c.slug);
    return {
      name: c.name,
      slug: c.slug,
      count: dbCount > 0 ? dbCount : staticCount,
    };
  });


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const input = cityInput.trim().toLowerCase();
    
    let citySlug = "stockholm";
    let queryParam = "";
    
    if (input.includes("göteborg") || input.includes("goteborg") || input.includes("gbg")) {
      citySlug = "goteborg";
    } else if (input.includes("malmö") || input.includes("malmo")) {
      citySlug = "malmo";
    } else if (input.includes("uppsala")) {
      citySlug = "uppsala";
    } else if (input.includes("västerås") || input.includes("vasteras")) {
      citySlug = "vasteras";
    } else if (input.includes("örebro") || input.includes("orebro")) {
      citySlug = "orebro";
    } else if (input.length > 0) {
      citySlug = "stockholm";
      queryParam = input;
    }
    
    navigate({
      to: "/$service/$city",
      params: { service, city: citySlug },
      search: queryParam ? { q: queryParam } : undefined
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          Nakima<span className="text-orange">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest">
          <Link to="/magasin" className="hover:text-orange transition-colors">Magasin</Link>
          <a href="#stader" className="hover:text-orange transition-colors">Sök klinik</a>
          <span className="text-ink/50 cursor-default" title="Kommer snart">För kliniker</span>
        </div>
        <span className="px-6 py-2 border border-ink/40 text-ink/60 text-xs font-bold uppercase tracking-widest cursor-default" title="Kommer snart">
          Logga in
        </span>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 px-6 pt-8 pb-20 items-center">
        <div className="md:col-span-7">
          <span className="inline-block bg-sage text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-6">
            Veckans fokus
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-8">
            Hitta din{" "}
            <span
              className="relative inline-block align-baseline overflow-hidden text-orange italic"
              style={{ paddingLeft: "0.4em", paddingRight: "0.15em", paddingBottom: "0.5em", marginBottom: "-0.5em", marginLeft: "-0.25em", minWidth: "7ch" }}
              aria-label="naprapat, kiropraktor, massör eller fysioterapeut"
            >
              <span className="nakima-word-1 absolute left-[0.2em] top-[0.11em] pl-[0.2em] whitespace-nowrap">naprapat</span>
              <span className="nakima-word-2 absolute left-[0.2em] top-[0.11em] pl-[0.2em] whitespace-nowrap">kiropraktor</span>
              <span className="nakima-word-3 absolute left-[0.2em] top-[0.11em] pl-[0.2em] whitespace-nowrap">massage</span>
              <span className="nakima-word-4 absolute left-[0.2em] top-[0.11em] pl-[0.2em] whitespace-nowrap">fysioterapeut</span>
              {/* Invisible sizer to reserve width for widest word */}
              <span className="invisible whitespace-nowrap">fysioterapeut</span>
            </span>
            <br />
            <span className="not-italic font-normal">nära dig.</span>
          </h1>
          <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">
            Nakima samlar granskade naprapater, kiropraktorer, massörer och fysioterapeuter i Sverige – och hjälper dig förstå din kropp med tydliga, pålitliga guider. Hitta rätt hjälp när den strejkar.
          </p>

          {/* Search widget */}
          <form onSubmit={handleSearch} className="bg-card shadow-2xl border border-border p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-sage">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Vad behöver du?
              </label>
              <select 
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-transparent font-medium focus:outline-none text-ink cursor-pointer"
              >
                <option value="naprapat">Naprapat</option>
                <option value="kiropraktor">Kiropraktor</option>
                <option value="massage">Massage</option>
                <option value="fysioterapeut">Fysioterapeut</option>
              </select>
            </div>
            <div className="flex-1 px-4 py-3">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Stad eller område
              </label>
              <input
                type="text"
                placeholder="Stockholm..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full bg-transparent font-medium focus:outline-none text-ink placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="bg-ink text-paper px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] hover:bg-orange transition-colors"
            >
              Hitta
            </button>
          </form>
        </div>

        <div className="md:col-span-5 relative">
          <img
            src={heroClinic}
            alt="Naprapat behandlar en patients nacke i en ljus skandinavisk klinik"
            width={1024}
            height={1280}
            className="w-full aspect-[4/5] object-cover bg-sage shadow-inner"
          />
          <div className="absolute -bottom-6 -left-6 bg-orange text-paper p-8 hidden md:block max-w-[16rem]">
            <p className="font-serif italic leading-tight text-lg">
              "Att förstå orsaken är första steget mot en smärtfri rygg."
            </p>
          </div>
        </div>
      </header>

      {/* Editorial rail */}
      <section id="magasin" className="bg-sage py-24 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-serif">Senaste från magasinet</h2>
            <Link
              to="/magasin"
              className="text-xs font-bold uppercase tracking-widest border-b border-ink/40 pb-1 text-ink-soft hover:text-orange hover:border-orange transition-colors"
            >
              Läs alla artiklar
            </Link>
          </div>
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
                  <p className="text-sm text-ink-soft leading-relaxed">{a.excerpt}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section id="stader" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-12 text-muted-foreground">
          Hitta kliniker i din stad
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cities.map((c) => (
            <Link
              to="/$service/$city"
              params={{ service: "naprapat", city: c.slug }}
              key={c.slug}
              className="py-8 border border-border hover:border-orange hover:bg-orange/5 transition-all"
            >
              <span className="block font-serif text-xl">{c.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {c.count > 0 ? `${c.count} kliniker` : "Kommer snart"}
              </span>
            </Link>
          ))}
        </div>

      </section>

      {/* How it works */}
      <section className="border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          {[
            { n: 1, t: "Välj behandlingstyp" },
            { n: 2, t: "Jämför legitimerade kliniker" },
            { n: 3, t: "Boka tid direkt online" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-6 flex-1">
              <div className="size-12 rounded-full border border-orange flex items-center justify-center font-serif italic text-orange text-lg shrink-0">
                {s.n}
              </div>
              <p className="text-sm font-medium">{s.t}</p>
              {i < arr.length - 1 && (
                <div className="h-px w-12 bg-border hidden md:block ml-auto" />
              )}
            </div>
          ))}
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
                <li><Link to="/$service/$city" params={{ service: "fysioterapeut", city: "stockholm" }} className="hover:text-paper transition-colors">Hitta fysioterapeut</Link></li>
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
                <li><Link to="/integritetspolicy" className="hover:text-paper transition-colors">Integritetspolicy</Link></li>
                <li><Link to="/ansvarsfriskrivning" className="hover:text-paper transition-colors">Ansvarsfriskrivning</Link></li>
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
