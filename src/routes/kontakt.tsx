import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { z } from "zod";
import { sendContactMessage, type ContactFormData } from "@/lib/contact";

const kontaktSearchSchema = z.object({
  amne: z.string().optional(),
});

export const Route = createFileRoute("/kontakt")({
  validateSearch: (search) => kontaktSearchSchema.parse(search),
  component: KontaktPage,
  head: () => ({
    meta: [
      { title: "Kontakta oss | Nakima" },
      {
        name: "description",
        content:
          "Kontakta redaktionen på Nakima. Har du frågor om våra guider, vill lista din klinik eller tipsa om ämnen inom manuell medicin?",
      },
      { property: "og:title", content: "Kontakta oss | Nakima" },
      {
        property: "og:description",
        content:
          "Kontakta oss på Nakima. Vi hjälper både patienter som söker vård och kliniker som vill synas.",
      },
    ],
    links: [{ rel: "canonical", href: "/kontakt" }],
  }),
});

function KontaktPage() {
  const { amne } = Route.useSearch();

  const initialCategory: ContactFormData["category"] =
    amne === "klinik"
      ? "klinik"
      : amne === "samarbete"
      ? "samarbete"
      : amne === "redaktionellt"
      ? "redaktionellt"
      : "allmant";

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    category: initialCategory,
    phone: "",
    clinicName: "",
    message: "",
    honeypot: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await sendContactMessage({ data: formData });
      if (response.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(response.message || "Ett oväntat fel uppstod. Vänligen försök igen.");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMessage(
        err?.message || "Kunde inte skicka meddelandet just nu. Vänligen mejla oss direkt på info@nakima.se."
      );
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "allmant",
      phone: "",
      clinicName: "",
      message: "",
      honeypot: "",
    });
    setStatus("idle");
    setErrorMessage("");
  };

  const faqs = [
    {
      q: "Hur listas min klinik på Nakima?",
      a: "Vi listar legitimerade naprapater, kiropraktorer, fysioterapeuter och certifierade massörer i Sverige. Välj 'Registrera / uppdatera klinik' i formuläret så granskar vi uppgifterna och lägger till er kostnadsfritt.",
    },
    {
      q: "Kostar det något att finnas med i registret?",
      a: "Grundprofilen på Nakima är helt kostnadsfri för legitimerade kliniker och utövare. Vårt mål är att erbjuda Sveriges mest kompletta och pålitliga guide för manuell medicin.",
    },
    {
      q: "Kan jag boka tid direkt via Nakima?",
      a: "Nakima guidar dig till rätt klinik och vidarebefordrar dig direkt till klinikens eget bokningssystem (t.ex. Bokadirekt eller klinikens hemsida).",
    },
    {
      q: "Hur snabbt får jag svar på mitt meddelande?",
      a: "Vår redaktion och support bemannas helgfria vardagar. Vi svarar vanligtvis inom 24 timmar.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col justify-between">
      <div>
        {/* Nav */}
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
            Nakima<span className="text-orange">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest">
            <Link to="/magasin" className="hover:text-orange transition-colors">
              Magasin
            </Link>
            <a href="/#stader" className="hover:text-orange transition-colors">
              Sök klinik
            </a>
            <Link
              to="/kontakt"
              search={{ amne: "klinik" }}
              className="hover:text-orange transition-colors"
            >
              För kliniker
            </Link>
          </div>
          <Link
            to="/kontakt"
            className="px-6 py-2 border border-ink text-ink text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
          >
            Kontakta oss
          </Link>
        </nav>

        {/* Header section */}
        <header className="border-b border-border bg-paper-subtle/50">
          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 text-orange text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="size-3.5" />
              <span>Redaktion & Support</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-ink mb-6 max-w-3xl">
              Hur kan vi hjälpa dig?
            </h1>
            <p className="text-ink-soft text-lg md:text-xl max-w-2xl leading-relaxed font-serif italic">
              Har du frågor om våra guider, vill du ansluta din klinik, eller har du synpunkter på
              innehållet? Skriv till oss så återkommer vi inom kort.
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left side: Form */}
            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm">
              {status === "success" ? (
                <div className="py-8 text-center space-y-6">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">
                      Tack för ditt meddelande!
                    </h2>
                    <p className="text-ink-soft max-w-md mx-auto leading-relaxed">
                      Vi har tagit emot ditt ärende och skickat en kopia till redaktionen på{" "}
                      <strong className="text-ink">info@nakima.se</strong>. Vi återkommer till{" "}
                      <span className="font-medium text-ink">{formData.email}</span> så snart som
                      möjligt.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-paper text-ink border border-border rounded-lg hover:bg-paper-subtle transition-colors"
                    >
                      Skicka ett till meddelande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-ink mb-2">Skicka ett meddelande</h2>
                    <p className="text-sm text-ink-soft">
                      Fyll i formuläret nedan så vidarebefordras ditt meddelande direkt till{" "}
                      <a href="mailto:info@nakima.se" className="underline hover:text-orange">
                        info@nakima.se
                      </a>
                      .
                    </p>
                  </div>

                  {status === "error" && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
                      <AlertCircle className="size-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Något gick fel</p>
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Anti-spam honeypot - hidden from real humans */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="hp_phone_field">Lämna detta fält tomt</label>
                    <input
                      type="text"
                      id="hp_phone_field"
                      name="hp_phone_field"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                      >
                        Ditt namn <span className="text-orange">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="För- och efternamn"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                      >
                        E-postadress <span className="text-orange">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="namn@exempel.se"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="contact-category"
                      className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                    >
                      Vad gäller ditt ärende? <span className="text-orange">*</span>
                    </label>
                    <select
                      id="contact-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ContactFormData["category"],
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm cursor-pointer"
                    >
                      <option value="allmant">Allmän fråga eller feedback</option>
                      <option value="klinik">Registrera / uppdatera klinik</option>
                      <option value="samarbete">Samarbete & Partnerskap</option>
                      <option value="redaktionellt">Redaktionellt tips / fråga om en artikel</option>
                      <option value="annat">Övrigt</option>
                    </select>
                  </div>

                  {/* Conditional / Extra Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                      >
                        Telefonnummer <span className="text-ink-soft/60 font-normal lowercase">(valfritt)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="070-123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-clinic"
                        className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                      >
                        Klinik / Företag <span className="text-ink-soft/60 font-normal lowercase">(valfritt)</span>
                      </label>
                      <input
                        id="contact-clinic"
                        type="text"
                        placeholder="T.ex. Stockholm Ryggklinik"
                        value={formData.clinicName}
                        onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold uppercase tracking-wider text-ink mb-2"
                    >
                      Meddelande <span className="text-orange">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Skriv ditt meddelande här..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-paper/50 text-ink focus:outline-none focus:border-orange focus:bg-white transition-all text-sm resize-y"
                    />
                  </div>

                  {/* Privacy note */}
                  <div className="flex items-start gap-2.5 text-xs text-ink-soft leading-relaxed">
                    <ShieldCheck className="size-4 text-orange shrink-0 mt-0.5" />
                    <span>
                      Genom att skicka meddelandet godkänner du att Nakima behandlar dina uppgifter för
                      att besvara ditt ärende. Läs mer i vår{" "}
                      <Link to="/integritetspolicy" className="underline hover:text-orange">
                        integritetspolicy
                      </Link>
                      .
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 px-8 rounded-lg bg-orange text-white font-medium text-sm tracking-wider uppercase hover:bg-orange/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Skickar meddelande...</span>
                      </>
                    ) : (
                      <>
                        <span>Skicka meddelande</span>
                        <Send className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right side: Information Cards & FAQ */}
            <div className="lg:col-span-5 space-y-8">
              {/* Direct Contact Card */}
              <div className="bg-ink text-paper p-8 rounded-2xl">
                <h3 className="font-serif text-xl font-bold mb-4 text-paper flex items-center gap-2">
                  <Mail className="size-5 text-orange" />
                  Direktkontakt
                </h3>
                <p className="text-sage/80 text-sm leading-relaxed mb-6">
                  Föredrar du att mejla direkt från ditt eget e-postprogram? Hör av dig till oss på:
                </p>
                <div className="p-4 bg-paper/5 rounded-xl border border-paper/10 mb-6">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-orange mb-1">
                    Officiell e-post
                  </div>
                  <a
                    href="mailto:info@nakima.se"
                    className="text-lg font-mono font-medium text-paper hover:text-orange transition-colors"
                  >
                    info@nakima.se
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-sage/70">
                  <Clock className="size-4 text-orange shrink-0" />
                  <span>Svarstid: Vanligtvis inom 24 timmar (helgfria vardagar).</span>
                </div>
              </div>

              {/* For Clinics Card */}
              <div className="bg-white p-8 rounded-2xl border border-border">
                <div className="size-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center mb-4">
                  <Building2 className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink mb-2">För kliniker & terapeuter</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-4">
                  Driver du en mottagning med legitimerade naprapater, kiropraktorer, fysioterapeuter
                  eller certifierade massörer? Vi hjälper patienter att hitta rätt vårdgivare i din stad.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, category: "klinik" }));
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-orange hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Registrera din klinik via formuläret &rarr;
                </button>
              </div>

              {/* FAQ Accordion */}
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="font-serif text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <HelpCircle className="size-5 text-orange" />
                  Vanliga frågor
                </h3>
                <div className="divide-y divide-border">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="py-3.5">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full text-left flex items-center justify-between gap-2 font-medium text-sm text-ink hover:text-orange transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            className={`size-4 text-ink-soft shrink-0 transition-transform ${
                              isOpen ? "rotate-180 text-orange" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="mt-2 text-xs leading-relaxed text-ink-soft pr-4">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer id="for-kliniker" className="bg-ink text-paper pt-20 pb-12 mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="text-2xl font-serif font-bold tracking-tight mb-6">
                Nakima<span className="text-orange">.</span>
              </div>
              <p className="text-sage/70 text-sm max-w-sm leading-relaxed">
                Sveriges redaktionella portal för manuell medicin. Vi gör det enkelt att hitta trygg
                och professionell vård – och att förstå vad du får hjälp med.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-orange">
                Tjänster
              </h4>
              <ul className="space-y-3 text-sm text-sage/80">
                <li>
                  <Link
                    to="/$service/$city"
                    params={{ service: "naprapat", city: "stockholm" }}
                    className="hover:text-paper transition-colors"
                  >
                    Hitta naprapat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/$service/$city"
                    params={{ service: "kiropraktor", city: "stockholm" }}
                    className="hover:text-paper transition-colors"
                  >
                    Hitta kiropraktor
                  </Link>
                </li>
                <li>
                  <Link
                    to="/$service/$city"
                    params={{ service: "massage", city: "stockholm" }}
                    className="hover:text-paper transition-colors"
                  >
                    Hitta massör
                  </Link>
                </li>
                <li>
                  <Link
                    to="/$service/$city"
                    params={{ service: "fysioterapeut", city: "stockholm" }}
                    className="hover:text-paper transition-colors"
                  >
                    Hitta fysioterapeut
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kontakt"
                    search={{ amne: "klinik" }}
                    className="hover:text-paper transition-colors"
                  >
                    För kliniker
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-orange">
                Information
              </h4>
              <ul className="space-y-3 text-sm text-sage/80">
                <li>
                  <Link to="/kontakt" className="hover:text-paper transition-colors">
                    Kontakta oss
                  </Link>
                </li>
                <li>
                  <Link to="/integritetspolicy" className="hover:text-paper transition-colors">
                    Integritetspolicy
                  </Link>
                </li>
                <li>
                  <Link to="/ansvarsfriskrivning" className="hover:text-paper transition-colors">
                    Ansvarsfriskrivning
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-sage/50">
              © 2026 Nakima Health Magazine – Billingskog
            </p>
            <div className="flex gap-6 text-[10px] uppercase tracking-widest text-sage/50">
              <a href="mailto:info@nakima.se" className="hover:text-paper transition-colors">
                info@nakima.se
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
