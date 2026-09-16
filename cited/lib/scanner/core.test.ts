import test, { mock } from "node:test";
import assert from "node:assert";
import { runCoreScan, mapStatusToSimple } from "./core";
import { BotAgent } from "./agents";

test("mapStatusToSimple maps correctly", () => {
  assert.strictEqual(mapStatusToSimple("ACCESSIBLE"), "OK");
  assert.strictEqual(mapStatusToSimple("BLOCKED_403"), "BLOQUÉ");
  assert.strictEqual(mapStatusToSimple("BLOCKED_CAPTCHA"), "BLOQUÉ");
  assert.strictEqual(mapStatusToSimple("EMPTY_JS_REQUIRED"), "COQUILLE VIDE");
  assert.strictEqual(mapStatusToSimple("ERROR"), "ERREUR");
});

test("runCoreScan identifies OK, BLOQUÉ and COQUILLE VIDE", async (t) => {
  // Mock global fetch
  const fetchMock = mock.fn(async (url: string | Request | URL, options?: RequestInit) => {
    const userAgent = (options?.headers as Record<string, string>)?.["User-Agent"] || "";
    
    // Simulate a block for GPTBot
    if (userAgent.includes("GPTBot")) {
      return {
        status: 403,
        text: async () => "Forbidden",
      } as Response;
    }
    
    // Simulate empty shell for ClaudeBot (SPA without SSR)
    if (userAgent.includes("ClaudeBot")) {
      return {
        status: 200,
        text: async () => '<div id="root"></div>',
      } as Response;
    }
    
    // Simulate OK for Browser and others
    return {
      status: 200,
      text: async () => "<html><body><p>Un texte très long pour que ça dépasse 50 mots. " + "mot ".repeat(60) + "</p></body></html>",
    } as Response;
  });
  
  global.fetch = fetchMock as any;
  
  const bots: BotAgent[] = ["GPTBot", "ClaudeBot", "PerplexityBot"];
  const results = await runCoreScan("https://example.com", bots);
  
  assert.strictEqual(results.length, 3);
  
  const gptResult = results.find(r => r.agent === "GPTBot");
  assert.strictEqual(gptResult?.simpleStatus, "BLOQUÉ");
  assert.strictEqual(gptResult?.httpStatus, 403);
  
  const claudeResult = results.find(r => r.agent === "ClaudeBot");
  assert.strictEqual(claudeResult?.simpleStatus, "COQUILLE VIDE");
  assert.strictEqual(claudeResult?.httpStatus, 200);
  
  const perpResult = results.find(r => r.agent === "PerplexityBot");
  assert.strictEqual(perpResult?.simpleStatus, "OK");
  assert.strictEqual(perpResult?.httpStatus, 200);
  
  mock.restoreAll();
});

test("runCoreScan handles fetch timeouts (AbortError) properly", async (t) => {
  const fetchMock = mock.fn(async () => {
    throw new DOMException("The operation was aborted", "AbortError");
  });
  global.fetch = fetchMock as any;

  const bots: BotAgent[] = ["GPTBot"];
  const results = await runCoreScan("https://slow-site.com", bots);
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].simpleStatus, "ERREUR");
  assert.strictEqual(results[0].httpStatus, 0);
  
  mock.restoreAll();
});

test("runCoreScan handles network errors like DNS resolution failure", async (t) => {
  const fetchMock = mock.fn(async () => {
    throw new TypeError("fetch failed"); 
  });
  global.fetch = fetchMock as any;

  const bots: BotAgent[] = ["ClaudeBot"];
  const results = await runCoreScan("https://not-found-domain.com", bots);
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].simpleStatus, "ERREUR");
  assert.strictEqual(results[0].httpStatus, 0);
  
  mock.restoreAll();
});

test("runCoreScan handles edge cases for exact text length (boundary 50 words)", async (t) => {
  const words49 = "mot ".repeat(49).trim(); 
  const words50 = "mot ".repeat(50).trim(); 

  const fetchMock = mock.fn(async (url: string | Request | URL, options?: RequestInit) => {
    const userAgent = (options?.headers as Record<string, string>)?.["User-Agent"] || "";
    
    if (userAgent.includes("GPTBot")) {
      return { status: 200, text: async () => `<html><body><p>${words49}</p></body></html>` } as Response;
    }
    
    if (userAgent.includes("ClaudeBot")) {
      return { status: 200, text: async () => `<html><body><p>${words50}</p></body></html>` } as Response;
    }
    
    return { status: 200, text: async () => `<html><body><p>${"mot ".repeat(200)}</p></body></html>` } as Response;
  });
  
  global.fetch = fetchMock as any;

  const results = await runCoreScan("https://edge-case.com", ["GPTBot", "ClaudeBot"]);
  
  const gptResult = results.find(r => r.agent === "GPTBot");
  assert.strictEqual(gptResult?.simpleStatus, "COQUILLE VIDE", "49 mots doit marquer la page comme COQUILLE VIDE");

  const claudeResult = results.find(r => r.agent === "ClaudeBot");
  assert.strictEqual(claudeResult?.simpleStatus, "OK", "50 mots doit suffire pour être OK");
  
  mock.restoreAll();
});
