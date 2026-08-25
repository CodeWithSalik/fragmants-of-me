import { adminDb } from "@/lib/firebase-admin";

const SITE_URL = "https://fragmants-of-me.vercel.app";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req, res) {
  try {
    const staticPages = [
      "",
      "/about",
      "/archive",
      "/authors",
      "/contact",
      "/credits",
      "/diary",
      "/monologues",
      "/poems",
      "/perspectives",
      "/quote",
      "/privacy",
      "/terms",
    ];

    const staticUrls = staticPages.map((path) => ({
      loc: `${SITE_URL}${path}`,
      priority: path === "" ? "1.0" : "0.7",
    }));

    const entriesSnapshot = await adminDb
      .collection("entries")
      .where("isPrivate", "==", false)
      .orderBy("timestamp", "desc")
      .get();

    const entryUrls = entriesSnapshot.docs.map((entryDoc) => {
      const data = entryDoc.data();

      const lastModified =
        data.timestamp &&
        typeof data.timestamp.toDate === "function"
          ? data.timestamp.toDate().toISOString()
          : new Date().toISOString();

      return {
        loc: `${SITE_URL}/entry/${entryDoc.id}`,
        lastmod: lastModified,
        priority: "0.8",
      };
    });

    const urls = [...staticUrls, ...entryUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls
  .map(
    (url) => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${
      url.lastmod
        ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>`
        : ""
    }
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );

    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Sitemap generation failed</error>`
    );
  }
}