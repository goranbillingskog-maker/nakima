import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articles } from "@/lib/articles-data";

export const Route = createFileRoute("/magasin/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) {
      throw notFound();
    }
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { article } = loaderData;
    const path = `/magasin/${article.slug}`;

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.metaDescription,
      "image": `https://nakima.se${article.image}`,
      "author": { "@type": "Organization", "name": "Nakima" },
      "publisher": { "@type": "Organization", "name": "Nakima" },
      "datePublished": article.datePublished,
      "mainEntityOfPage": `https://nakima.se${path}`
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": article.faqs.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a,
        },
      })),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Nakima", "item": "https://nakima.se" },
        { "@type": "ListItem", "position": 2, "name": "Magasin", "item": "https://nakima.se/magasin" },
        { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://nakima.se${path}` }
      ]
    };

    return {
      meta: [
        { title: article.metaTitle },
        { name: "description", content: article.metaDescription },
        { property: "og:title", content: article.metaTitle },
        { property: "og:description", content: article.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://nakima.se${path}` },
        { property: "og:image", content: `https://nakima.se${article.image}` },
        { property: "og:locale", content: "sv_SE" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(articleSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();

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

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-xs uppercase tracking-widest text-ink-soft border-b border-border">
        <Link to="/" className="hover:text-orange">Nakima</Link>
        <span className="mx-2">/</span>
        <Link to="/magasin" className="hover:text-orange">Magasin</Link>
        <span className="mx-2">/</span>
        <span className="text-ink/60">{article.title}</span>
      </div>

      <article className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        {/* Category & Date */}
        <div className="flex items-center gap-4 mb-6 text-xs uppercase tracking-wider font-bold text-orange">
          <span>{article.tag}</span>
          <span className="text-ink/20">•</span>
          <span className="text-ink-soft font-normal">{article.datePublished}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.1] mb-6">
          {article.title}
        </h1>

        {/* Byline */}
        <p className="text-xs uppercase tracking-widest text-ink-soft mb-12">
          Av: <span className="font-bold text-ink">{article.byline}</span>
        </p>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] mb-12 overflow-hidden bg-sage">
          <img
            src={article.image}
            alt={article.title}
            width={1200}
            height={675}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Content */}
        <div className="prose prose-ink max-w-none mb-16 space-y-6 text-ink-soft leading-relaxed text-base md:text-lg">
          {article.content.map((section, idx) => {
            switch (section.type) {
              case "p":
                return <p key={idx}>{section.text}</p>;
              case "h2":
                return (
                  <h2 key={idx} className="font-serif text-2xl md:text-3xl text-ink pt-6 mb-4">
                    {section.text}
                  </h2>
                );
              case "list":
                return (
                  <ul key={idx} className="list-disc pl-6 space-y-3">
                    {section.items?.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                );
              case "cta":
                return (
                  <div key={idx} className="my-10 p-8 border border-orange bg-orange/5 text-center">
                    <p className="font-serif text-xl text-ink mb-4">
                      Behöver du träffa en professionell terapeut?
                    </p>
                    <Link
                      to="/$service/$city"
                      params={{ service: "naprapat", city: "stockholm" }}
                      className="inline-block bg-ink text-paper px-8 py-3 font-bold uppercase text-xs tracking-[0.2em] hover:bg-orange transition-colors"
                    >
                      {section.text}
                    </Link>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>

        {/* FAQ section */}
        <div className="border-t border-ink/10 pt-16">
          <h2 className="font-serif text-3xl mb-8">Vanliga frågor</h2>
          <dl className="divide-y divide-ink/10 border-t border-b border-ink/10">
            {article.faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-serif text-xl text-ink mb-2">{f.q}</dt>
                <dd className="text-ink-soft leading-relaxed text-base">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 pt-8 border-t border-ink/10 text-xs text-ink-soft/80 leading-relaxed">
          <p className="mb-2">
            <strong>Om innehållet:</strong> Den här artikeln är allmän hälsoinformation, framtagen redaktionellt av Nakima, och ersätter inte medicinsk rådgivning, diagnos eller behandling från läkare eller annan legitimerad vårdgivare. Reagera aldrig på egen hand vid akuta eller allvarliga symtom — kontakta 1177 för sjukvårdsrådgivning eller ring 112 vid livshotande tillstånd. Nakima ansvarar inte för beslut som fattas enbart baserat på innehållet i denna artikel.
          </p>
          {article.slug === "vad-kostar-en-naprapat-2026" && (
            <p>
              Prisuppgifter och skatteregler i denna artikel är vägledande och kan ändras. Kontrollera alltid aktuellt pris med kliniken och aktuella regler med Skatteverket eller din arbetsgivare innan du bokar.
            </p>
          )}
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
