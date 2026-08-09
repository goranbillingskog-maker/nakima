import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getCity,
  getClinicFaq,
  getPriceLevelInfo,
  priceLabel,
  priceLevelInfo,
  serviceLabels,
  treatmentDescriptions,
  weekdayLabels,
  type CitySlug,
  type ServiceSlug,
} from "@/lib/clinics-data";
import { fetchClinicBySlug, fetchRelatedClinics } from "@/lib/db";
import { type DatabaseClinic } from "@/lib/supabase";

const weekdayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const Route = createFileRoute("/$service/$city/$clinic")({
  loader: async ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    
    const serviceSlug = params.service as ServiceSlug;
    const clinic = await fetchClinicBySlug(city.slug as CitySlug, params.clinic);
    if (!clinic) throw notFound();
    
    // Map database shape to standard static structure if necessary
    const mappedClinic = {
      ...clinic,
      openingHours: clinic.hours_mon || clinic.hours_tue || clinic.hours_wed || clinic.hours_thu || clinic.hours_fri || clinic.hours_sat || clinic.hours_sun ? {
        mon: clinic.hours_mon || "Stängt",
        tue: clinic.hours_tue || "Stängt",
        wed: clinic.hours_wed || "Stängt",
        thu: clinic.hours_thu || "Stängt",
        fri: clinic.hours_fri || "Stängt",
        sat: clinic.hours_sat || "Stängt",
        sun: clinic.hours_sun || "Stängt",
      } : undefined
    };

    const related = await fetchRelatedClinics(clinic, 3);
    
    // Create FAQ using the original structure compatible format
    const legacyClinicCompat = {
      name: clinic.name,
      street: clinic.street || "",
      postal: clinic.postal || "",
      neighborhood: clinic.neighborhood || "",
      phone: clinic.phone || "",
      bookingUrl: clinic.booking_url,
      priceLevel: (clinic.price_level ?? 2) as 1 | 2 | 3,
      services: clinic.services as ServiceSlug[],
    };
    const faq = getClinicFaq(legacyClinicCompat, city);
    
    return { city, clinic, mappedClinic, related, faq, service: serviceSlug };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { city, clinic, faq, service } = loaderData;
    const path = `/${service}/${params.city}/${params.clinic}`;
    
    const label = serviceLabels[service];
    const serviceList = clinic.services
      .map((s: string) => serviceLabels[s as ServiceSlug]?.singular.toLowerCase() || s)
      .join(", ");
    
    const title = `${clinic.name} – ${label.singular.toLowerCase()} i ${clinic.neighborhood || city.name}, ${city.name} | Nakima`;
    const description = `${clinic.name} är en ${label.singular.toLowerCase()}klinik på ${clinic.street}, ${clinic.neighborhood || city.name} i ${city.name}. Betyg ${clinic.rating.toFixed(1)}/5 (${clinic.reviewCount} omdömen). Erbjuder ${serviceList}. Boka tid, se priser och kontaktuppgifter.`;

    const postalCode = clinic.postal ? clinic.postal.split(" ")[0] : "";
    const addressLocality = clinic.postal ? clinic.postal.split(" ").slice(1).join(" ") : city.name;

    const medicalBusiness: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": path,
      name: clinic.name,
      description: clinic.description,
      url: path,
      ...(clinic.phone ? { telephone: clinic.phone } : {}),
      priceRange: "$".repeat(clinic.price_level ?? 2),
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.street,
        addressLocality,
        postalCode,
        addressRegion: city.region,
        addressCountry: "SE",
      },
      areaServed: { "@type": "City", name: city.name },
      medicalSpecialty: "PhysicalTherapy",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: clinic.rating,
        reviewCount: clinic.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    };
    if (clinic.lat != null && clinic.lng != null) {
      medicalBusiness.geo = {
        "@type": "GeoCoordinates",
        latitude: clinic.lat,
        longitude: clinic.lng,
      };
    }
    
    if (clinic.hours_mon || clinic.hours_tue) {
      const dbHours: Record<string, string | null> = {
        mon: clinic.hours_mon,
        tue: clinic.hours_tue,
        wed: clinic.hours_wed,
        thu: clinic.hours_thu,
        fri: clinic.hours_fri,
        sat: clinic.hours_sat,
        sun: clinic.hours_sun,
      };
      const spec = weekdayOrder
        .map((d) => {
          const value = dbHours[d];
          if (!value || /stängt/i.test(value)) return null;
          const match = value.match(/(\d{1,2}[:.]\d{2})\s*[–-]\s*(\d{1,2}[:.]\d{2})/);
          if (!match) return null;
          return {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${weekdayLabels[d].schema}`,
            opens: match[1].replace(".", ":"),
            closes: match[2].replace(".", ":"),
          };
        })
        .filter(Boolean);
      if (spec.length) medicalBusiness.openingHoursSpecification = spec;
    }
    if (clinic.languages?.length) medicalBusiness.knowsLanguage = clinic.languages;
    if (clinic.payment_methods?.length)
      medicalBusiness.paymentAccepted = clinic.payment_methods.join(", ");
    if (clinic.booking_url) {
      medicalBusiness.potentialAction = {
        "@type": "ReserveAction",
        target: clinic.booking_url,
        name: "Boka tid",
      };
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

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
          children: JSON.stringify(medicalBusiness),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Nakima", item: "/" },
              { "@type": "ListItem", position: 2, name: label.singular, item: `/${service}` },
              { "@type": "ListItem", position: 3, name: city.name, item: `/${service}/${params.city}` },
              { "@type": "ListItem", position: 4, name: clinic.name, item: path },
            ],
          }),
        },
      ],
    };
  },
  component: ClinicPage,
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
        <h1 className="font-serif text-4xl mb-3">Kliniken hittades inte</h1>
        <p className="text-ink-soft mb-6">
          Den här kliniken finns inte i vår katalog – eller så har den bytt namn.
        </p>
        <Link to="/" className="underline text-orange">
          Gå till startsidan
        </Link>
      </div>
    </div>
  ),
});

function ClinicPage() {
  const { city, clinic, mappedClinic, related, faq, service } = Route.useLoaderData();
  const tel = clinic.phone ? clinic.phone.replace(/\s/g, "") : "";
  const postalCode = clinic.postal ? clinic.postal.split(" ")[0] : "";
  const addressLocality = clinic.postal ? clinic.postal.split(" ").slice(1).join(" ") : city.name;
  
  const priceLevel = clinic.price_level ?? 2;
  const price = getPriceLevelInfo(priceLevel);
  const primaryService = (clinic.services[0] || service) as ServiceSlug;
  const treatment = treatmentDescriptions[primaryService] || treatmentDescriptions.massage;
  const label = serviceLabels[service];

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
          <Link
            to="/$service/$city"
            params={{ service, city: city.slug }}
            className="hover:text-orange transition-colors"
          >
            Sök klinik
          </Link>
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
        <Link to="/" className="hover:text-orange">Nakima</Link>
        <span className="mx-2">/</span>
        <span>{label.singular}</span>
        <span className="mx-2">/</span>
        <Link
          to="/$service/$city"
          params={{ service, city: city.slug }}
          className="hover:text-orange"
        >
          {city.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{clinic.name}</span>
      </div>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-12 border-b border-ink/10">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-block bg-sage text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            {clinic.neighborhood || city.name} · {city.name}
          </span>
          {clinic.featured && (
            <span className="bg-orange text-paper text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              Redaktionens val
            </span>
          )}
          {clinic.established && (
            <span className="border border-ink/30 text-ink-soft text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              Etablerad {clinic.established}
            </span>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6 max-w-4xl">
          {clinic.name}
        </h1>
        <p className="text-lg text-ink-soft max-w-3xl leading-relaxed">{clinic.description}</p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-ink-soft border-t border-ink/10 pt-8">
          <div>
            <div className="font-serif text-3xl text-ink">{clinic.rating.toFixed(1)}</div>
            <div className="uppercase tracking-widest text-[10px]">
              av 5 · {clinic.reviewCount} omdömen
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl text-ink">
              {priceLabel(priceLevel as 1|2|3)}
            </div>
            <div className="uppercase tracking-widest text-[10px]">
              {price.dots} · {price.range}
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl text-ink">
              {clinic.services.length}
            </div>
            <div className="uppercase tracking-widest text-[10px]">
              behandlingsformer
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl text-ink">Leg.</div>
            <div className="uppercase tracking-widest text-[10px]">
              Socialstyrelsen
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {clinic.booking_url ? (
            <a
              href={clinic.booking_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="bg-ink text-paper px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-orange transition-colors"
            >
              Boka tid online
            </a>
          ) : null}
          {clinic.phone ? (
            <a
              href={`tel:${tel}`}
              className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
            >
              Ring {clinic.phone}
            </a>
          ) : null}
        </div>
      </header>

      {/* Facts + about */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <article className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              Om {clinic.name}
            </h2>
            <p className="text-ink-soft leading-relaxed mb-6">{clinic.description}</p>
            <p className="text-ink-soft leading-relaxed">
              Kliniken ligger i {clinic.neighborhood || city.name}, {city.name}, och tar emot patienter för
              {" "}
              {clinic.services.map((s: string, i: number) => (
                <span key={s}>
                  {i > 0 && (i === clinic.services.length - 1 ? " och " : ", ")}
                  <strong className="text-ink">{serviceLabels[s as ServiceSlug]?.singular.toLowerCase() || s}</strong>
                </span>
              ))}
              . Nakima har redaktionellt granskat {clinic.name} och verifierat att verksamheten drivs av legitimerad personal registrerad hos Socialstyrelsen (eller certifierad yrkesutbildning för massörer).
            </p>
          </div>

          {/* Treatment explainer */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              Vad är {treatment.title.toLowerCase()}?
            </h2>
            <p className="text-ink-soft leading-relaxed mb-6">
              {treatment.description}
            </p>
            <h3 className="font-serif text-xl mb-3">
              Vanliga besvär {clinic.name} behandlar
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {(clinic.specialties?.length ? clinic.specialties : treatment.treats).map((t: string) => (
                <li key={t} className="flex items-start gap-3 text-ink-soft">
                  <span className="text-orange mt-1">●</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* First visit expectations */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              Vad händer vid ditt första besök?
            </h2>
            <ol className="space-y-4 text-ink-soft leading-relaxed">
              <li className="border-l-2 border-orange pl-4">
                <strong className="text-ink font-serif text-lg block mb-1">1. Anamnes (10–15 min)</strong>
                Samtal där behandlaren går igenom dina besvär, sjukdomshistorik och livssituation för att förstå orsakerna.
              </li>
              <li className="border-l-2 border-orange pl-4">
                <strong className="text-ink font-serif text-lg block mb-1">2. Fysisk undersökning</strong>
                Rörlighets- och funktionstester av leder, muskler och nerver för att lokalisera problemets ursprung.
              </li>
              <li className="border-l-2 border-orange pl-4">
                <strong className="text-ink font-serif text-lg block mb-1">3. Behandling</strong>
                Manuella tekniker anpassade efter din diagnos: mobilisering, mjukdelsbehandling och/eller manipulation.
              </li>
              <li className="border-l-2 border-orange pl-4">
                <strong className="text-ink font-serif text-lg block mb-1">4. Träningsråd & uppföljning</strong>
                Du får med dig hemövningar och en plan för uppföljande besök om det behövs.
              </li>
            </ol>
          </div>

          {/* Behandlingar chips */}
          <div>
            <h3 className="font-serif text-2xl mb-4">Behandlingsformer på kliniken</h3>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              {clinic.services.map((s: string) => (
                <li
                  key={s}
                  className="border border-ink/15 bg-sage/30 px-4 py-3 uppercase tracking-widest text-[11px] font-bold"
                >
                  {serviceLabels[s as ServiceSlug]?.singular || s}
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Vanliga frågor</h2>
            <dl className="divide-y divide-ink/10 border-t border-b border-ink/10">
              {faq.map((f: { q: string; a: string }) => (
                <div key={f.q} className="py-5">
                  <dt className="font-serif text-lg text-ink mb-2">{f.q}</dt>
                  <dd className="text-ink-soft leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>

        <aside className="space-y-6 h-fit lg:sticky lg:top-6">
          <div className="border border-ink/15 bg-sage/30 p-6">
            <h2 className="font-serif text-2xl mb-5">Kontakt & besök</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                  Adress
                </dt>
                <dd className="text-ink">
                  {clinic.street}
                  <br />
                  {postalCode} {addressLocality}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                  Telefon
                </dt>
                <dd>
                  {clinic.phone ? (
                    <a href={`tel:${tel}`} className="text-ink underline hover:text-orange">
                      {clinic.phone}
                    </a>
                  ) : (
                    <span className="text-ink-soft">Bokning sker via hemsida</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                  Bokning
                </dt>
                <dd>
                  {clinic.booking_url ? (
                    <a
                      href={clinic.booking_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-ink underline hover:text-orange break-all"
                    >
                      Boka online
                    </a>
                  ) : (
                    <span className="text-ink-soft">Ring för bokning</span>
                  )}
                </dd>
              </div>
              {clinic.website && (
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                     Webbsida
                  </dt>
                  <dd>
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-ink underline hover:text-orange break-all"
                    >
                      {clinic.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                  Region
                </dt>
                <dd className="text-ink">{city.region}</dd>
              </div>
            </dl>
          </div>

          {/* Opening hours */}
          <div className="border border-ink/15 bg-paper p-6">
            <h2 className="font-serif text-2xl mb-4">Öppettider</h2>
            {mappedClinic.openingHours ? (
              <table className="w-full text-sm">
                <tbody>
                  {weekdayOrder.map((d) => {
                    const value = mappedClinic.openingHours?.[d];
                    return (
                      <tr key={d} className="border-b border-ink/5 last:border-0">
                        <td className="py-2 text-ink-soft uppercase tracking-widest text-[10px] font-bold">
                          {weekdayLabels[d].short}
                        </td>
                        <td className="py-2 text-right text-ink">
                          {value ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-ink-soft leading-relaxed">
                Öppettider har inte verifierats. Kontakta kliniken direkt eller
                se aktuella tider i bokningssystemet.
              </p>
            )}
          </div>

          {/* Facts */}
          {(clinic.languages?.length ||
            clinic.payment_methods?.length ||
            clinic.accessibility?.length) && (
            <div className="border border-ink/15 bg-paper p-6">
              <h2 className="font-serif text-2xl mb-4">På kliniken</h2>
              <dl className="space-y-4 text-sm">
                {clinic.languages?.length ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                      Språk
                    </dt>
                    <dd className="text-ink">{clinic.languages.join(", ")}</dd>
                  </div>
                ) : null}
                {clinic.payment_methods?.length ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                      Betalning
                    </dt>
                    <dd className="text-ink">{clinic.payment_methods.join(", ")}</dd>
                  </div>
                ) : null}
                {clinic.accessibility?.length ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1">
                      Tillgänglighet
                    </dt>
                    <dd className="text-ink">{clinic.accessibility.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}

          {/* Price */}
          <div className="border border-ink/15 bg-paper p-6">
            <h2 className="font-serif text-2xl mb-4">Prisnivå</h2>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-orange text-2xl">{price.dots}</span>
              <span className="font-serif text-xl text-ink">{price.label}</span>
            </div>
            <p className="text-sm text-ink-soft">
              {price.range} för en standardbehandling. Första besöket kan
              vara något dyrare.
            </p>
          </div>
        </aside>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-ink/10 bg-sage/30">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <h2 className="font-serif text-3xl md:text-4xl">
                Fler kliniker i närheten
              </h2>
              <Link
                to="/$service/$city"
                params={{ service, city: city.slug }}
                className="text-xs uppercase tracking-widest font-bold text-orange hover:underline"
              >
                Se alla i {city.name}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
              {related.map((r: DatabaseClinic) => (
                <Link
                  key={r.slug}
                  to="/$service/$city/$clinic"
                  params={{ service, city: city.slug, clinic: r.slug }}
                  className="bg-paper p-6 hover:bg-sage/50 transition-colors group"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">
                    {r.neighborhood}
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-orange transition-colors">
                    {r.name}
                  </h3>
                  <div className="text-sm text-ink-soft">
                    {r.rating.toFixed(1)} · {r.reviewCount} omdömen
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-ink text-paper/80 px-6 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="font-serif text-3xl text-paper mb-2">
              Nakima<span className="text-orange">.</span>
            </div>
            <p className="text-sm max-w-xs">
              Sveriges redaktionella guide till manuell medicin.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-paper/10 text-xs text-paper/50">
          © {new Date().getFullYear()} Nakima – del av Billingskog.
        </div>
      </footer>
    </div>
  );
}
