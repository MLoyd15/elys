const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export default async function handler(request, response) {
  const configuredApiUrl = process.env.API_URL;
  if (!configuredApiUrl) {
    return response.status(503).json({ error: "The API_URL deployment setting is missing." });
  }

  let apiUrl;
  try {
    apiUrl = new URL(configuredApiUrl);
    if (!["https:", "http:"].includes(apiUrl.protocol)) {
      throw new Error("API_URL must use HTTP or HTTPS.");
    }
  } catch {
    return response.status(500).json({ error: "The API_URL deployment setting is invalid." });
  }

  const incomingUrl = new URL(request.url || "/", "https://nursepath.local");
  let targetUrl = `${incomingUrl.pathname}${incomingUrl.search}`;
  if (incomingUrl.pathname === "/api/proxy") {
    targetUrl = incomingUrl.searchParams.get("path") || "";
    if (!targetUrl.startsWith("/api/")) {
      return response.status(400).json({ error: "The API proxy path is invalid." });
    }
  }

  const upstreamUrl = new URL(targetUrl, apiUrl);
  if (upstreamUrl.origin !== apiUrl.origin || !upstreamUrl.pathname.startsWith("/api/")) {
    return response.status(400).json({ error: "The API proxy path is invalid." });
  }
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (HOP_BY_HOP_HEADERS.has(name.toLowerCase()) || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else {
      headers.set(name, value);
    }
  }

  const hasBody = !["GET", "HEAD"].includes(request.method || "GET");
  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? request : undefined,
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
    });

    response.statusCode = upstreamResponse.status;
    for (const [name, value] of upstreamResponse.headers) {
      const lowerName = name.toLowerCase();
      if (
        lowerName !== "set-cookie" &&
        lowerName !== "content-encoding" &&
        lowerName !== "content-length" &&
        !HOP_BY_HOP_HEADERS.has(lowerName)
      ) {
        response.setHeader(name, value);
      }
    }
    const cookies = upstreamResponse.headers.getSetCookie();
    if (cookies.length > 0) response.setHeader("Set-Cookie", cookies);

    response.end(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch (error) {
    console.error("API proxy request failed:", error);
    response.status(502).json({ error: "The study API is temporarily unavailable." });
  }
}
