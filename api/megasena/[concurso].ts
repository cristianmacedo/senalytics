import type { VercelRequest, VercelResponse } from "@vercel/node";

const CAIXA_API_BASE =
  "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { concurso } = req.query;

  try {
    // Build the API URL
    const url =
      concurso && concurso !== "latest"
        ? `${CAIXA_API_BASE}/${concurso}`
        : CAIXA_API_BASE;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Senalytics/1.0",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Caixa API returned ${response.status}`,
      });
    }

    const data = await response.json();

    // Cache for 5 minutes for latest, 1 day for specific draws
    const cacheTime = concurso && concurso !== "latest" ? 86400 : 300;

    res.setHeader(
      "Cache-Control",
      `s-maxage=${cacheTime}, stale-while-revalidate`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from Caixa API:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch data from Caixa API" });
  }
}
