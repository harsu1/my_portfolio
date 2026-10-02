import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Single-page site: one canonical URL. Section anchors are intentionally not
 * listed — they are fragments of the same document, not separate pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
