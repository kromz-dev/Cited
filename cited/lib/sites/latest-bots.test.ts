import { describe, expect, it } from "vitest";
import { assistantSnapshots } from "./latest-bots";

describe("assistantSnapshots", () => {
  it("lit le code et la cause de chaque assistant dans le dernier journal", () => {
    const rows = assistantSnapshots({
      httpStatus: 200,
      simpleStatus: "BLOQUÉ",
      cause: "ClaudeBot : robots.txt interdit ClaudeBot",
      createdAt: new Date("2026-09-02T03:00:00Z"),
      payload: JSON.stringify({
        results: [
          { agent: "GPTBot", httpStatus: 200, cause: "GPTBot : aucune restriction détectée" },
          { agent: "ClaudeBot", httpStatus: 200, cause: "ClaudeBot : robots.txt interdit ClaudeBot" },
        ],
      }),
    });
    expect(rows.map((row) => row.httpStatus)).toEqual([200, 200]);
    expect(rows[1]?.cause).toContain("robots.txt interdit ClaudeBot");
    expect(rows[1]?.fix).toContain("robots.txt");
  });

  it("utilise le code du journal quand le payload n'a pas de détail", () => {
    const rows = assistantSnapshots({
      httpStatus: 503,
      simpleStatus: null,
      cause: null,
      createdAt: new Date("2026-09-02T03:00:00Z"),
      payload: null,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.httpStatus).toBe(503);
    expect(rows[0]?.cause).toBe("HTTP 503");
  });
});
