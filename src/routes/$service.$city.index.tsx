import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  getCity,
  getPriceLevelInfo,
  priceLabel,
  serviceLabels,
  type CitySlug,
  type ServiceSlug,
} from "@/lib/clinics-data";
import { fetchClinicsByCity } from "@/lib/db";
import { type DatabaseClinic } from "@/lib/supabase";

const sortOptions = ["rating", "reviews", "name", "distance"] as const;

// Haversine great-circle distance in km between two WGS84 points.
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  omrade: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(sortOptions), "rating").default("rating"),
});

interface Faq { q: string; a: string; }
function getCityFaqs(cityName: string, serviceLabel: string): Faq[] {
  const singularLower = serviceLabel.toLowerCase();
  const definiteLower = singularLower === "massage" ? "massagen" : `${singularLower}en`;
  
  return [
    {
      q: `Vad kostar ett besök hos en ${singularLower} i ${cityName}?`,
      a: `Ett förstabesök hos en ${singularLower} i ${cityName} kostar typiskt 600–900 kr. Uppföljande behandlingar ligger på 550–800 kr. Många kliniker accepterar friskvårdsbidrag.`,
    },
    {
      q: `Hur vet jag att ${definiteLower} är legitimerad eller certifierad?`,
      a: `Alla naprapater och kiropraktorer vi listar har legitimation från Socialstyrelsen. Massörer är certifierade med godkänd yrkesutbildning. Du kan verifiera legitimationer via Socialstyrelsens register (HOSP).`,
    },
    {
      q: `Naprapat, kiropraktor eller massage – vad passar mig?`,
      a: `Naprapati kombinerar manipulation och mjukdelsbehandling för rörelseapparaten. Kiropraktik fokuserar mer på ryggrad och ledmanipulation. Massage inriktar sig på mjukdelsbehandling, muskelspänningar och cirkulation.`,
    },
  ];
}

export const Route = createFileRoute("/$service/$city/")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    
    const serviceSlug = params.service as ServiceSlug;
    const clinics = await fetchClinicsByCity(city.slug as CitySlug, serviceSlug);
    
    return { city, clinics, service: serviceSlug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { city, clinics, service } = loaderData;
    const label = serviceLabels[service];
    const path = `/${service}/${city.slug}`;
    const title = `${label.plural} i ${city.name} – ${clinics.length} kliniker | Nakima`;
    const description = `Hitta ${label.singular.toLowerCase()} i ${city.name}. ${clinics.length} redaktionellt granskade kliniker med betyg, priser och direktbokning. Uppdaterad ${new Date().getFullYear()}.`;
    const faqs = getCityFaqs(city.name, label.singular);
    
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: path },
        { property: "og:locale", content: "sv_SE" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${label.plural} i ${city.name}`,
            numberOfItems: clinics.length,
            itemListElement: clinics.map((c: DatabaseClinic, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "MedicalBusiness",
                name: c.name,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: c.street,
                  addressLocality: c.city,
                  postalCode: c.postal ? c.postal.split(" ")[0] : "",
                  addressCountry: "SE",
                },
                telephone: c.phone,
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: c.rating,
                  reviewCount: c.reviewCount,
                },
              },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Nakima", item: "/" },
              { "@type": "ListItem", position: 2, name: label.singular, item: `/${service}` },
              { "@type": "ListItem", position: 3, name: city.name, item: path },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f: Faq) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: CityPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl mb-3">Något gick fel</h1>
        <p className="text-ink-soft">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl mb-3">Sidan hittades inte</h1>
        <p className="text-ink-soft mb-6">
          Vi täcker just nu Stockholm, Göteborg och Malmö.
        </p>
        <Link to="/" className="underline text-orange">
          Till startsidan
        </Link>
      </div>
    </div>
  ),
});

const sortLabels: Record<(typeof sortOptions)[number], string> = {
  rating: "Betyg",
  reviews: "Antal omdömen",
  name: "A–Ö",
  distance: "Närmast mig",
};

function CityPage() {
  const { city, clinics, service } = Route.useLoaderData();
  const { q, omrade, sort } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const label = serviceLabels[service];
  const faqs = getCityFaqs(city.name, label.singular);

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "unavailable">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("nakima:userpos");
      if (!raw) return;
      const cached = JSON.parse(raw) as { lat: number; lng: number; ts: number };
      if (Date.now() - cached.ts < 30 * 60 * 1000) {
        setUserPos({ lat: cached.lat, lng: cached.lng });
      } else {
        window.localStorage.removeItem("nakima:userpos");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos((prev) =>
          prev && prev.lat === next.lat && prev.lng === next.lng ? prev : next
        );
        try {
          window.localStorage.setItem(
            "nakima:userpos",
            JSON.stringify({ ...next, ts: Date.now() })
          );
        } catch {
          /* ignore */
        }
        setGeoStatus("idle");
        updateSearch({ sort: "distance" });
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const clearLocation = () => {
    setUserPos(null);
    try {
      window.localStorage.removeItem("nakima:userpos");
    } catch {
      /* ignore */
    }
    updateSearch({ sort: "rating" });
  };

  const neighborhoods = useMemo<string[]>(
    () =>
      Array.from(
        new Set<string>(clinics.map((c: DatabaseClinic) => c.neighborhood).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "sv")),
    [clinics]
  );

  const withDistance = useMemo(() => {
    if (!userPos) return clinics.map((c: DatabaseClinic) => ({ clinic: c, distance: null as number | null }));
    return clinics.map((c: DatabaseClinic) => ({
      clinic: c,
      distance:
        c.lat != null && c.lng != null
          ? distanceKm(userPos, { lat: c.lat, lng: c.lng })
          : null,
    }));
  }, [clinics, userPos]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = withDistance.filter(({ clinic: c }: { clinic: DatabaseClinic; distance: number | null }) => {
      if (omrade && c.neighborhood !== omrade) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        (c.neighborhood && c.neighborhood.toLowerCase().includes(needle)) ||
        (c.street && c.street.toLowerCase().includes(needle))
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "distance" && userPos) {
        const ad = a.distance ?? Infinity;
        const bd = b.distance ?? Infinity;
        if (ad !== bd) return ad - bd;
      }
      if (sort === "reviews") return b.clinic.reviewCount - a.clinic.reviewCount;
      if (sort === "name") return a.clinic.name.localeCompare(b.clinic.name, "sv");
      
      if (a.clinic.featured !== b.clinic.featured) return a.clinic.featured ? -1 : 1;
      if (b.clinic.rating !== a.clinic.rating) return b.clinic.rating - a.clinic.rating;
      return b.clinic.reviewCount - a.clinic.reviewCount;
    });
    return list;
  }, [withDistance, q, omrade, sort, userPos]);

  const matchedCityName = useMemo(() => {
    const input = q.trim().toLowerCase();
    if (!input) return null;
    if (input.includes("göteborg") || input.includes("goteborg") || input.includes("gbg")) return { slug: "goteborg", name: "Göteborg" };
    if (input.includes("malmö") || input.includes("malmo")) return { slug: "malmo", name: "Malmö" };
    if (input.includes("uppsala")) return { slug: "uppsala", name: "Uppsala" };
    if (input.includes("västerås") || input.includes("vasteras")) return { slug: "vasteras", name: "Västerås" };
    if (input.includes("örebro") || input.includes("orebro")) return { slug: "orebro", name: "Örebro" };
    if (input.includes("norrköping") || input.includes("norrkoping")) return { slug: "norrkoping", name: "Norrköping" };
    if (input.includes("linköping") || input.includes("linkoping")) return { slug: "linkoping", name: "Linköping" };
    if (input.includes("helsingborg") || input.includes("hbg")) return { slug: "helsingborg", name: "Helsingborg" };
    if (input.includes("jönköping") || input.includes("jonkoping") || input.includes("jkpg")) return { slug: "jonkoping", name: "Jönköping" };
    if (input.includes("stockholm")) return { slug: "stockholm", name: "Stockholm" };
    return null;
  }, [q]);

  const updateSearch = (patch: Partial<{ q: string; omrade: string; sort: (typeof sortOptions)[number] }>) => {
    navigate({
      search: (prev: { q: string; omrade: string; sort: (typeof sortOptions)[number] }) => ({ ...prev, ...patch }),
      replace: true,
    });
  };

  const resetFilters = () => {
    navigate({ search: { q: "", omrade: "", sort: "rating" as const }, replace: true });
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          Nakima<span className="text-orange">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-orange transition-colors">
            Magasin
          </Link>
          <a href="#kliniker" className="hover:text-orange transition-colors">
            Sök klinik
          </a>
          <span className="text-ink-soft cursor-default" title="Kommer snart">
            För kliniker
          </span>
        </div>
        <span
          className="border border-ink/40 text-ink-soft px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-default"
          title="Kommer snart"
        >
          Logga in
        </span>
      </nav>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-2 text-xs uppercase tracking-widest text-ink-soft">
        <Link to="/" className="hover:text-orange">
          Nakima
        </Link>
        <span className="mx-2">/</span>
        <span>{label.singular}</span>
        <span className="mx-2">/</span>
        <span className="text-ink">{city.name}</span>
      </div>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-12 border-b border-ink/10">
        <span className="inline-block bg-sage text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-6">
          Stadsguide · {city.region}
        </span>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6 max-w-4xl">
          {label.plural} i <span className="italic text-orange">{city.name}</span>
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">{city.intro}</p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-soft">
          <div>
            <span className="font-serif text-3xl text-ink mr-2">{clinics.length}</span>
            listade kliniker
          </div>
          <div>
            <span className="font-serif text-3xl text-ink mr-2">
              {clinics.length
                ? (
                    clinics.reduce((s: number, c: DatabaseClinic) => s + c.rating, 0) / clinics.length
                  ).toFixed(1)
                : "–"}
            </span>
            snittbetyg
          </div>
          <div>
            <span className="font-serif text-3xl text-ink mr-2">{neighborhoods.length}</span>
            stadsdelar
          </div>
        </div>
      </header>

      {/* Filters */}
      <section id="kliniker" className="max-w-7xl mx-auto px-6 pt-12">
        <div className="border border-ink/15 bg-sage/30 p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:gap-4 md:items-end">
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1.5">
                Sök klinik eller adress
              </span>
              <input
                type="search"
                inputMode="search"
                placeholder={`T.ex. ${neighborhoods[0] || 'Centrum'}, Götgatan, Klinikens namn…`}
                value={q}
                onChange={(e) => updateSearch({ q: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matchedCityName && matchedCityName.slug !== city.slug) {
                    e.preventDefault();
                    navigate({
                      to: "/$service/$city",
                      params: { service, city: matchedCityName.slug },
                      search: { q: "", omrade: "", sort: "rating" as const }
                    });
                  }
                }}
                className="w-full bg-paper border border-ink/20 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-orange"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1.5">
                Stadsdel
              </span>
              <select
                value={omrade}
                onChange={(e) => updateSearch({ omrade: e.target.value })}
                className="w-full md:w-56 bg-paper border border-ink/20 px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-orange"
              >
                <option value="">Alla stadsdelar</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1.5">
                Sortera
              </span>
              <select
                value={sort}
                onChange={(e) => updateSearch({ sort: e.target.value as (typeof sortOptions)[number] })}
                className="w-full md:w-44 bg-paper border border-ink/20 px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-orange"
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s}>
                    {sortLabels[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-xs text-ink-soft flex-wrap">
            <span>
              Visar <span className="text-ink font-medium">{filtered.length}</span> av{" "}
              {clinics.length} kliniker
              {omrade && <> · <span className="text-ink">{omrade}</span></>}
              {sort === "distance" && userPos && <> · sorterat efter avstånd</>}
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={requestLocation}
                disabled={geoStatus === "loading"}
                className="uppercase tracking-widest font-bold text-ink hover:text-orange disabled:opacity-50"
              >
                {geoStatus === "loading"
                  ? "Hämtar plats…"
                  : userPos
                  ? "Uppdatera min plats"
                  : "Använd min plats"}
              </button>
              {userPos && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="uppercase tracking-widest font-bold text-ink-soft hover:text-orange"
                >
                  Rensa plats
                </button>
              )}
              {(q || omrade || sort !== "rating") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="uppercase tracking-widest font-bold text-orange hover:underline"
                >
                  Rensa filter
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Clinic list */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        {filtered.length === 0 ? (
          <div className="border border-ink/15 bg-sage/40 px-8 py-16 text-center">
            <h2 className="font-serif text-3xl mb-3">Inga kliniker matchar</h2>
            <p className="text-ink-soft max-w-md mx-auto">
              Prova en annan stadsdel eller sökterm.
            </p>
            {matchedCityName && matchedCityName.slug !== city.slug ? (
              <div className="mt-8 p-6 bg-paper border border-orange/20 max-w-md mx-auto shadow-sm">
                <p className="text-sm text-ink mb-4 font-medium">
                  Vill du söka efter {label.plural.toLowerCase()} i {matchedCityName.name}?
                </p>
                <Link
                  to="/$service/$city"
                  params={{ service, city: matchedCityName.slug }}
                  search={{ q: "", omrade: "", sort: "rating" as const }}
                  className="inline-block bg-orange hover:bg-ink text-paper px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Visa kliniker i {matchedCityName.name}
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-block border border-ink px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
              >
                Rensa filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
            {filtered.map(({ clinic, distance }: { clinic: DatabaseClinic; distance: number | null }) => (
              <article
                key={clinic.slug}
                className="relative bg-paper p-8 flex flex-col group hover:bg-sage/30 transition-colors"
              >
                <Link
                  to="/$service/$city/$clinic"
                  params={{ service, city: city.slug, clinic: clinic.slug }}
                  aria-label={`Läs mer om ${clinic.name}`}
                  preload="intent"
                  className="absolute inset-0 z-20"
                />
                <div className="flex items-start justify-between gap-4 mb-3 relative z-10 pointer-events-none">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                        {clinic.neighborhood}
                      </span>
                      {clinic.featured && (
                        <span className="bg-orange text-paper text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                          Redaktionens val
                        </span>
                      )}
                      {distance != null && (
                        <span className="border border-ink/30 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                          {distance < 10 ? distance.toFixed(1) : Math.round(distance)} km bort
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl leading-tight group-hover:text-orange transition-colors">
                      {clinic.name}
                    </h2>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif text-2xl">{clinic.rating.toFixed(1)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-soft">
                      {clinic.reviewCount} omdömen
                    </div>
                  </div>
                </div>

                <p className="text-ink-soft leading-relaxed mb-6 relative z-10 pointer-events-none">{clinic.description}</p>

                <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 text-sm border-t border-ink/10 pt-5 relative z-10 pointer-events-none">
                  <div className="text-ink-soft">
                    <div>{clinic.street}</div>
                    <div>{clinic.postal}</div>
                  </div>
                  <div className="text-ink-soft">
                    <span className="uppercase tracking-widest text-[10px] block mb-0.5">
                      Prisnivå
                    </span>
                    {(() => {
                      const level = clinic.price_level ?? 2;
                      const info = getPriceLevelInfo(level);
                      return (
                        <span
                          className="font-medium text-ink"
                          title={info.range}
                        >
                          {info.dots} {priceLabel(level as 1|2|3)}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="ml-auto flex items-center gap-3 pointer-events-auto relative z-30">
                    {clinic.phone ? (
                      <a
                        href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                        className="text-sm underline hover:text-orange"
                      >
                        {clinic.phone}
                      </a>
                    ) : null}
                    {clinic.booking_url ? (
                      <a
                        href={clinic.booking_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="bg-ink text-paper px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-orange transition-colors"
                      >
                        Boka tid
                      </a>
                    ) : clinic.phone ? (
                      <a
                        href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                        className="border border-ink px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
                      >
                        Ring kliniken
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Editorial FAQ */}
      <section className="border-t border-ink/10 bg-sage/30">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <span className="inline-block bg-paper text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-6 border border-ink/10">
            Guide
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mb-10 leading-tight">
            Att välja {label.singular.toLowerCase()} i {city.name}
          </h2>
          <div className="space-y-8 text-ink-soft leading-relaxed">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-serif text-2xl text-ink mb-2">{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-paper/80 px-6 py-16 mt-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="font-serif text-3xl text-paper mb-2">
              Nakima<span className="text-orange">.</span>
            </div>
            <p className="text-sm max-w-xs">
              Sveriges redaktionella guide till manuell medicin.
            </p>
          </div>
          <div className="flex gap-16 text-sm">
            <div>
              <div className="text-xs uppercase tracking-widest text-paper mb-3">
                Städer
              </div>
              <ul className="space-y-2">
                {["stockholm", "goteborg", "malmo"].map((cSlug) => (
                  <li key={cSlug}>
                    <Link
                      to="/$service/$city"
                      params={{ service, city: cSlug }}
                      className="hover:text-paper capitalize"
                    >
                      {cSlug === "goteborg" ? "Göteborg" : cSlug === "malmo" ? "Malmö" : cSlug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-paper/10 text-xs text-paper/50">
          © {new Date().getFullYear()} Nakima – del av Billingskog.
        </div>
      </footer>
    </div>
  );
}
