import { describe, it, expect } from "vitest";
import { resolveDomainName } from "./domain-name";

describe("resolveDomainName (T051)", () => {
  it("utilise l'URL réelle du MonitoredSite quand il existe", () => {
    expect(resolveDomainName({ url: "https://client-reel.fr/" }, null, "abc123")).toBe(
      "client-reel.fr",
    );
  });

  it("retombe sur le domaine du Site legacy quand aucun MonitoredSite n'existe", () => {
    expect(resolveDomainName(null, { domain: "legacy-client.fr" }, "abc123")).toBe(
      "legacy-client.fr",
    );
  });

  it("n'invente jamais un domaine de démonstration quand rien n'est trouvé (principe II)", () => {
    // Avant T051, un siteId littéralement "client-vitrine" déclenchait un
    // domaine fictif ("client-vitrine.bubbleapps.io") au lieu de refléter
    // l'absence réelle de site. Le nom affiché doit rester l'identifiant brut.
    expect(resolveDomainName(null, null, "client-vitrine")).toBe("client-vitrine");
  });

  it("retombe sur l'identifiant brut de la route pour tout autre id inconnu", () => {
    expect(resolveDomainName(null, null, "site-inexistant")).toBe("site-inexistant");
  });
});
