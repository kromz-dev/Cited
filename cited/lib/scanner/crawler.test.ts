import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) => {
    if (host === "internal.example.com") return [{ address: "10.0.0.5", family: 4 }];
    if (host === "mixed.example.com") return [{ address: "93.184.216.34", family: 4 }, { address: "127.0.0.1", family: 4 }];
    if (host === "nxdomain.example.com") throw new Error("getaddrinfo ENOTFOUND");
    return [{ address: "93.184.216.34", family: 4 }];
  }),
}));

import { assertSafeUrl, crawlUrl, MAX_REDIRECTS } from "./crawler";

function stubFetch(routes: Record<string, () => Response>) {
  const fn = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    void init;
    const route = routes[String(input)];
    if (!route) throw new TypeError(`unexpected fetch ${String(input)}`);
    return route();
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const redirect = (location: string, status = 301) => () => new Response(null, { status, headers: { location } });

describe("assertSafeUrl", () => {
  it("accepts public http(s) URLs", async () => {
    await expect(assertSafeUrl("https://example.com/a")).resolves.toBe("https://example.com/a");
  });

  it.each([
    ["ftp://example.com/", /protocol/],
    ["https://user:pass@example.com/", /Credentials/],
    ["https://internal.example.com/", /Forbidden IP/],
    ["https://mixed.example.com/", /Forbidden IP/],
    ["https://nxdomain.example.com/", /DNS resolution failed/],
  ])("rejects %s", async (url, message) => {
    await expect(assertSafeUrl(url)).rejects.toThrow(message);
  });
});

describe("crawlUrl redirects", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("follows http→https and apex→www redirects", async () => {
    const fetchMock = stubFetch({
      "http://example.com/": redirect("https://example.com/"),
      "https://example.com/": redirect("https://www.example.com/", 308),
      "https://www.example.com/": () => new Response("<p>hello</p>", { headers: { "X-Robots-Tag": "noindex" } }),
    });

    const res = await crawlUrl("http://example.com/");
    expect(res.error).toBeUndefined();
    expect(res.status).toBe(200);
    expect(res.finalUrl).toBe("https://www.example.com/");
    expect(res.html).toBe("<p>hello</p>");
    expect(res.headers["x-robots-tag"]).toBe("noindex");
    expect(res.redirects).toEqual([
      { url: "http://example.com/", status: 301, location: "https://example.com/" },
      { url: "https://example.com/", status: 308, location: "https://www.example.com/" },
    ]);
    // fetch ne doit jamais suivre seul une redirection.
    for (const [, init] of fetchMock.mock.calls) expect(init?.redirect).toBe("manual");
  });

  it("resolves relative Location headers against the current URL", async () => {
    stubFetch({
      "https://example.com/old": redirect("/new?x=1", 302),
      "https://example.com/new?x=1": () => new Response("ok"),
    });
    const res = await crawlUrl("https://example.com/old");
    expect(res.status).toBe(200);
    expect(res.finalUrl).toBe("https://example.com/new?x=1");
  });

  it(`allows exactly ${MAX_REDIRECTS} redirects`, async () => {
    const routes: Record<string, () => Response> = {};
    for (let i = 0; i < MAX_REDIRECTS; i++) routes[`https://example.com/${i}`] = redirect(`https://example.com/${i + 1}`);
    routes[`https://example.com/${MAX_REDIRECTS}`] = () => new Response("done");
    stubFetch(routes);

    const res = await crawlUrl("https://example.com/0");
    expect(res.status).toBe(200);
    expect(res.redirects).toHaveLength(MAX_REDIRECTS);
  });

  it("fails after more than 5 redirects", async () => {
    const routes: Record<string, () => Response> = {};
    for (let i = 0; i <= MAX_REDIRECTS; i++) routes[`https://example.com/${i}`] = redirect(`https://example.com/${i + 1}`);
    const fetchMock = stubFetch(routes);

    const res = await crawlUrl("https://example.com/0");
    expect(res.status).toBe(0);
    expect(res.error).toMatch(/Too many redirects/);
    expect(fetchMock).toHaveBeenCalledTimes(MAX_REDIRECTS + 1);
  });

  it("re-runs the SSRF check on every Location and never fetches a private target", async () => {
    const fetchMock = stubFetch({
      "https://example.com/": redirect("https://www.example.com/"),
      "https://www.example.com/": redirect("http://internal.example.com/admin", 302),
    });
    const res = await crawlUrl("https://example.com/");
    expect(res.status).toBe(0);
    expect(res.error).toMatch(/Forbidden IP resolved: 10\.0\.0\.5/);
    expect(fetchMock.mock.calls.map(([u]) => String(u))).not.toContain("http://internal.example.com/admin");
  });

  it("refuses a redirect to a non-http scheme", async () => {
    stubFetch({ "https://example.com/": redirect("file:///etc/passwd") });
    const res = await crawlUrl("https://example.com/");
    expect(res.status).toBe(0);
    expect(res.error).toMatch(/protocol/);
  });

  it("returns a 3xx without Location as a final response", async () => {
    stubFetch({ "https://example.com/": () => new Response("not modified", { status: 300 }) });
    const res = await crawlUrl("https://example.com/");
    expect(res.status).toBe(300);
    expect(res.redirects).toEqual([]);
  });
});
