import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import * as scannerCore from "@/lib/scanner/core";

vi.mock("@/lib/scanner/core", () => ({
  runCoreScan: vi.fn(),
}));

describe("POST /api/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any, ip: string = "127.0.0.1") => {
    return new Request("http://localhost:3000/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    });
  };

  it("should return 400 if URL is invalid", async () => {
    const req = createRequest({ url: "not-a-url" }, "ip-invalid-url");
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Veuillez fournir une URL valide, incluant http:// ou https://");
  });

  it("should return 400 if body is missing URL", async () => {
    const req = createRequest({}, "ip-missing-url");
    const res = await POST(req);
    
    expect(res.status).toBe(400);
  });

  it("should return 200 and scan results for a valid URL", async () => {
    vi.mocked(scannerCore.runCoreScan).mockResolvedValueOnce([
      { agent: "GPTBot", simpleStatus: "OK", httpStatus: 200, durationMs: 150, wordCount: 500 }
    ]);

    const req = createRequest({ url: "https://example.com" }, "ip-valid-url");
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.agent).toBe("GPTBot");
    expect(data.simpleStatus).toBe("OK");
    expect(scannerCore.runCoreScan).toHaveBeenCalledWith("https://example.com", ["GPTBot"]);
  });

  it("should rate limit after 3 requests from the same IP", async () => {
    const ip = "ip-rate-limit";
    const body = { url: "https://example.com" };
    
    vi.mocked(scannerCore.runCoreScan).mockResolvedValue([
      { agent: "GPTBot", simpleStatus: "OK", httpStatus: 200, durationMs: 100, wordCount: 100 }
    ]);

    const res1 = await POST(createRequest(body, ip));
    expect(res1.status).toBe(200);

    const res2 = await POST(createRequest(body, ip));
    expect(res2.status).toBe(200);

    const res3 = await POST(createRequest(body, ip));
    expect(res3.status).toBe(200);

    const res4 = await POST(createRequest(body, ip));
    expect(res4.status).toBe(429);
    const data = await res4.json();
    expect(data.error).toBe("Trop de requêtes. Veuillez réessayer dans quelques instants.");
  });

  it("should return 500 if scan throws an error", async () => {
    vi.mocked(scannerCore.runCoreScan).mockRejectedValueOnce(new Error("Scanner failed"));

    const req = createRequest({ url: "https://example.com" }, "ip-error");
    const res = await POST(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Une erreur interne est survenue lors de l'analyse.");
  });
});
