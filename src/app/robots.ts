import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/reservation/confirmation"],
      },
    ],
    sitemap: "https://tikiboat.fr/sitemap.xml",
    host: "https://tikiboat.fr",
  };
}
