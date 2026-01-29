import type { VercelRequest, VercelResponse } from "@vercel/node";

const WEBFLOW_BASE = "https://api.webflow.com/v2";

function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

const ALLOWED_COLLECTION_IDS = new Set<string>(
    [
        process.env.VITE_COLLECTION_BLOG_POSTS,
        process.env.VITE_COLLECTION_CLIENT_LOGOS,
        process.env.VITE_COLLECTION_DRONE_PORTFOLIO,
        process.env.VITE_COLLECTION_LEADERS,
        process.env.VITE_COLLECTION_PORTFOLIO,
        process.env.VITE_COLLECTION_TOUR_SLIDES,
        process.env.VITE_COLLECTION_HERO_CONTENT,
        process.env.VITE_COLLECTION_PAGE_CONTENT,
        process.env.VITE_COLLECTION_TESTIMONIALS,
        process.env.VITE_COLLECTION_PRIVACY_CONTENT,
        process.env.VITE_COLLECTION_TERMS_CONTENT,
        process.env.VITE_COLLECTION_INDUSTRY_SOLUTIONS,
        process.env.VITE_COLLECTION_PRODUCTION_SERVICES,
        process.env.VITE_COLLECTION_STUDIO_AMENITIES,
        process.env.VITE_COLLECTION_CONNECT_FEATURES,
    ].filter(Boolean) as string[]
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const token = requireEnv("WEBFLOW_API_TOKEN");
        const collectionId = (req.query.collectionId as string | undefined)?.trim();
        const live = String(req.query.live ?? "1") === "1";
        const limit = Math.min(Number(req.query.limit ?? 100), 100);
        const offset = Math.max(Number(req.query.offset ?? 0), 0);

        if (!collectionId) return res.status(400).json({ error: "Missing query param: collectionId" });
        if (!ALLOWED_COLLECTION_IDS.has(collectionId)) {
            return res.status(403).json({ error: "Collection not allowed" });
        }

        const path = live
            ? `/collections/${collectionId}/items/live`
            : `/collections/${collectionId}/items`;

        const url = new URL(`${WEBFLOW_BASE}${path}`);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("offset", String(offset));

        const wf = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`,
                "accept-version": "2.0.0",
            },
        });

        if (!wf.ok) {
            const txt = await wf.text().catch(() => "");
            return res.status(502).json({ error: "Webflow upstream error", status: wf.status, body: txt });
        }

        const data = await wf.json();
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json(data);
    } catch (e: any) {
        return res.status(500).json({ error: e?.message ?? "Unknown error" });
    }
}
