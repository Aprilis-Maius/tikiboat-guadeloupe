"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");

  const excLinks = [
    { href: "/excursions/grand-cul-de-sac-marin", label: t("links.croisiere") },
    { href: "/excursions/privatisation",           label: t("links.privatisation") },
    { href: "/reservation",                        label: t("links.reserver") },
  ];

  const infoLinks = [
    { href: "/galerie",  label: t("infoLinks.galerie") },
    { href: "/avis",     label: t("infoLinks.avis") },
    { href: "/blog",     label: t("infoLinks.blog") },
    { href: "/contact",  label: t("infoLinks.contact") },
  ];

  return (
    <footer className="bg-tiki-ocean border-t border-tiki-lagon/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Image src="/logo.png" alt="Tiki Boat" width={180} height={60}
                className="h-14 w-auto object-contain" />
              <div className="text-tiki-cream-dark text-sm mt-1">{t("tagline")}</div>
            </div>
            <p className="text-tiki-cream-dark leading-relaxed mb-6 max-w-md">{t("description")}</p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/tikiboatguadeloupe/" target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 bg-tiki-ocean border border-white/15 rounded-full flex items-center justify-center text-white/60 hover:text-tiki-gold hover:border-tiki-gold transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.facebook.com/tikiboatguadeloupe/?locale=fr_FR" target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 bg-tiki-ocean border border-white/15 rounded-full flex items-center justify-center text-white/60 hover:text-tiki-gold hover:border-tiki-gold transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.youtube.com/@TikiBoatGuadeloupe" target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 bg-tiki-ocean border border-white/15 rounded-full flex items-center justify-center text-white/60 hover:text-tiki-gold hover:border-tiki-gold transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h3 className="font-bold text-tiki-gold text-sm uppercase tracking-widest mb-5">{t("excursions")}</h3>
            <ul className="space-y-3">
              {excLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-bold text-tiki-gold text-sm uppercase tracking-widest mb-5 mt-8">{t("info")}</h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-tiki-gold text-lg mb-4">{t("contact")}</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+590690495848" className="flex items-start gap-3 text-tiki-cream-dark hover:text-tiki-gold transition-colors group">
                  <Phone size={18} className="mt-0.5 shrink-0 group-hover:text-tiki-gold" />
                  <div>
                    <div className="font-medium text-tiki-cream text-sm">{t("tel")}</div>
                    <div className="text-sm">+590 690 49 58 48</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:tikiboatguadeloupe@gmail.com" className="flex items-start gap-3 text-tiki-cream-dark hover:text-tiki-gold transition-colors group">
                  <Mail size={18} className="mt-0.5 shrink-0 group-hover:text-tiki-gold" />
                  <div>
                    <div className="font-medium text-tiki-cream text-sm">Email</div>
                    <div className="text-sm">tikiboatguadeloupe@gmail.com</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-tiki-cream-dark">
                  <MapPin size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-tiki-cream text-sm">{t("zone")}</div>
                    <div className="text-sm">{t("zoneValue")}</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-tiki-gold/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-tiki-cream-dark/60">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/mentions-legales" className="hover:text-tiki-gold transition-colors">{t("mentions")}</Link>
            <Link href="/cgv" className="hover:text-tiki-gold transition-colors">{t("cgv")}</Link>
            <Link href="/confidentialite" className="hover:text-tiki-gold transition-colors">{t("confidentialite")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
