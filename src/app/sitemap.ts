import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://guru.cintabuku.site";
  const now = new Date();
  const lastmod = now.toISOString().split("T")[0];

  return [
    { url: base, lastModified: lastmod, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/register`, lastModified: lastmod, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/checkout`, lastModified: lastmod, changeFrequency: "monthly", priority: 0.6 },
  ];
}