import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatBlogDate } from "@/data/blog";
import { getPublishedPosts } from "@/lib/blog-db";
import SiteImage from "@/components/SiteImage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Conseils excursions en Guadeloupe",
  description:
    "Conseils, guides et inspiration pour vos excursions en bateau en Guadeloupe. Snorkeling, îlets, Grand Cul de Sac Marin, activités en famille.",
  alternates: { canonical: "https://tiki-boat.com/blog" },
  openGraph: {
    title: "Blog Tiki Boat — Conseils excursions en Guadeloupe",
    description: "Guides et conseils pour vos excursions en mer en Guadeloupe.",
    url: "https://tiki-boat.com/blog",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Guide:       "bg-tiki-gold/15 text-tiki-gold border-tiki-gold/25",
  Destination: "bg-tiki-lagon/15 text-tiki-lagon-light border-tiki-lagon/25",
  Activité:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Famille:     "bg-purple-500/15 text-purple-300 border-purple-500/25",
  Événement:   "bg-tiki-red/15 text-tiki-red-light border-tiki-red/25",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="pt-32 pb-14 bg-sky-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-tiki-gold text-xs font-bold tracking-[0.25em] uppercase mb-4">Blog</p>
          <h1 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-4">
            Conseils & guides pour vos excursions en Guadeloupe
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Spots de snorkeling, activités en famille, guide du Grand Cul de Sac Marin — tout pour préparer votre séjour en mer.
          </p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-300 text-sm">
              Aucun article publié pour le moment.
            </div>
          ) : (
            <div className="space-y-10">
              {/* Article à la une */}
              {featured && (
                <Link href={`/blog/${featured.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-tiki-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="relative h-56 sm:h-auto min-h-[220px]">
                      <SiteImage
                        src={featured.coverImage} alt={featured.title}
                        label={featured.coverLabel || featured.title}
                        fill className="object-cover"
                      />
                    </div>
                    <div className="p-7 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[featured.category] ?? "bg-white/10 text-white/50 border-slate-200"}`}>
                          {featured.category}
                        </span>
                        <span className="text-slate-300 text-xs">À la une</span>
                      </div>
                      <h2 className="font-display font-black text-slate-800 text-xl leading-tight mb-3 group-hover:text-tiki-gold transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-slate-400 text-xs">
                        <span>{formatBlogDate(featured.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {featured.readTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grille */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {rest.map((post: (typeof posts)[number]) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-tiki-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 flex flex-col">
                      <div className="relative h-44 overflow-hidden">
                        <SiteImage
                          src={post.coverImage} alt={post.title}
                          label={post.coverLabel || post.title}
                          fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border self-start mb-3 ${CATEGORY_COLORS[post.category] ?? "bg-white/10 text-white/50 border-slate-200"}`}>
                          {post.category}
                        </span>
                        <h2 className="font-display font-black text-slate-800 text-base leading-tight mb-2 flex-1 group-hover:text-tiki-gold transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-slate-400 text-xs pt-3 border-t border-slate-200">
                          <span>{formatBlogDate(post.date)}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} min</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
