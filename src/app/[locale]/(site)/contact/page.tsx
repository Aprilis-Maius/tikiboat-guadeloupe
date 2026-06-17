import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  alternates: { canonical: "https://tikiboat.fr/contact" },
  openGraph: { url: "https://tikiboat.fr/contact", type: "website" },
  title: "Contact",
  description: "Contactez Tiki Boat pour réserver votre excursion en Guadeloupe ou obtenir des informations.",
};

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">{t("title")}</h1>
          <p className="section-subtitle max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-tiki-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-tiki-gold mb-8">{t("coordonnees")}</h2>
              <ul className="space-y-6 mb-10">
                <li>
                  <a href="tel:+590690495848" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-tiki-lagon/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tiki-lagon/25 transition-colors">
                      <Phone className="text-tiki-gold" size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-tiki-gold transition-colors">{t("tel")}</div>
                      <div className="text-slate-500">+590 690 49 58 48</div>
                      <div className="text-slate-500 text-xs mt-1">{t("telSub")}</div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="mailto:tikiboatguadeloupe@gmail.com" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-tiki-lagon/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tiki-lagon/25 transition-colors">
                      <Mail className="text-tiki-gold" size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-tiki-gold transition-colors">{t("email")}</div>
                      <div className="text-slate-500">tikiboatguadeloupe@gmail.com</div>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-tiki-lagon/15 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="text-tiki-gold" size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t("zone")}</div>
                      <div className="text-slate-500">{t("zoneValue")}</div>
                      <div className="text-slate-500 text-xs mt-1">{t("zoneDepart")}</div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-tiki-lagon/15 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="text-tiki-gold" size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t("dispo")}</div>
                      <div className="text-slate-500">{t("dispoValue")}</div>
                    </div>
                  </div>
                </li>
              </ul>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/590690495848?text=Bonjour%20!%20Je%20souhaite%20avoir%20des%20informations%20sur%20Tiki%20Boat."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {t("whatsapp")}
              </a>
            </div>

            {/* Form */}
            <div>
              <h2 className="font-display text-2xl font-bold text-tiki-gold mb-8">{t("formTitle")}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
