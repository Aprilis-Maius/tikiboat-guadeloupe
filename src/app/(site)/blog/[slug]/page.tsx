import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, ChevronRight } from "lucide-react";
import { formatBlogDate } from "@/data/blog";
import { getPublishedPosts, getPostBySlug, parseContent } from "@/lib/blog-db";
import SiteImage from "@/components/SiteImage";
import type { Section } from "@/data/blog";

export const dynamic = "force-dynamic";

const BASE = "https://tiki-boat.com";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords ? post.keywords.split(",").map((k: string) => k.trim()) : [],
    alternates: { canonical: `${BASE}/blog/${slug}` },
    openGraph: {
      title: post.title, description: post.excerpt,
      url: `${BASE}/blog/${slug}`, type: "article",
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts.filter((p: typeof allPosts[number]) => p.slug !== slug).slice(0, 2);
  const sections: Section[] = parseContent(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}/blog/${slug}` },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.updatedAt.toISOString().split("T")[0],
        author: { "@type": "Organization", name: "Tiki Boat", url: BASE },
        publisher: { "@id": `${BASE}/#business` },
        inLanguage: "fr-FR",
        url: `${BASE}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="pt-20 bg-slate-900">
        <div className="relative h-[45vh] min-h-[280px]">
          <SiteImage
            src={post.coverImage} alt={post.title}
            label={post.coverLabel || post.title}
            fill className="object-cover" priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tiki-ocean via-tiki-ocean/50 to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 pb-8 px-5 sm:px-8">
            <div className="max-w-3xl mx-auto">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-800 text-sm mb-4 transition-colors">
                <ArrowLeft size={14} /> Retour au blog
              </Link>
              <h1 className="font-display font-black text-slate-800 text-2xl sm:text-3xl lg:text-4xl leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="bg-sky-50 py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">

          <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-slate-200 text-sm text-slate-400">
            <span className="text-tiki-gold font-medium">{post.category}</span>
            <span>{formatBlogDate(post.date)}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> {post.readTime} min de lecture</span>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => {
              if (section.type === "h2") return (
                <h2 key={i} className="font-display font-black text-slate-800 text-xl sm:text-2xl mt-10 mb-2">
                  {section.text}
                </h2>
              );
              if (section.type === "h3") return (
                <h3 key={i} className="font-bold text-tiki-gold text-lg mt-6 mb-1">{section.text}</h3>
              );
              if (section.type === "p") return (
                <p key={i} className="text-slate-600 text-base leading-relaxed">{section.text}</p>
              );
              if (section.type === "ul") return (
                <ul key={i} className="space-y-2 pl-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <span className="text-tiki-gold mt-1 shrink-0">·</span>{item}
                    </li>
                  ))}
                </ul>
              );
              return null;
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-tiki-gold/20">
            <Link href="/reservation"
              className="inline-flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3.5 px-7 rounded-full transition-all hover:scale-105 text-sm">
              Réserver une excursion <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <h2 className="font-display font-black text-slate-800 text-xl mb-7">À lire aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-tiki-gold/30 transition-all">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <SiteImage src={p.coverImage} alt={p.title} label={p.coverLabel || p.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-tiki-gold text-xs font-medium mb-1">{p.category}</p>
                    <p className="text-slate-800 text-sm font-bold leading-tight group-hover:text-tiki-gold transition-colors line-clamp-2">{p.title}</p>
                    <p className="text-slate-400 text-xs mt-1.5">{formatBlogDate(p.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
