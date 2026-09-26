import { describe, it, expect } from "vitest";
import type { ReactElement, ReactNode } from "react";
import LoginPage from "./page";
import { LoginForm } from "./LoginForm";

/**
 * `LoginPage` est un Server Component asynchrone sans hook : on peut
 * l'invoquer directement (même principe que `app/(app)/reports/page.test.ts`)
 * et inspecter l'arbre JSX renvoyé sans moteur de rendu DOM.
 */
function findByType(
  node: ReactNode,
  type: unknown,
): ReactElement<{ callbackUrl?: string; children?: ReactNode }> | null {
  if (node == null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByType(child, type);
      if (found) return found;
    }
    return null;
  }
  const element = node as ReactElement<{ callbackUrl?: string; children?: ReactNode }>;
  if (element.type === type) return element;
  if (element.props && "children" in element.props) {
    return findByType(element.props.children, type);
  }
  return null;
}

describe("LoginPage (T051)", () => {
  it("branche LoginForm sur /dashboard quand aucun callbackUrl n'est fourni", async () => {
    const jsx = await LoginPage({ searchParams: Promise.resolve({}) });

    const form = findByType(jsx, LoginForm);
    expect(form).not.toBeNull();
    expect(form?.props.callbackUrl).toBe("/dashboard");
  });

  it("transmet un callbackUrl interne sûr tel quel (retour vers la page protégée demandée)", async () => {
    const jsx = await LoginPage({
      searchParams: Promise.resolve({ callbackUrl: "/sites/abc123" }),
    });

    const form = findByType(jsx, LoginForm);
    expect(form?.props.callbackUrl).toBe("/sites/abc123");
  });

  it("retombe sur /dashboard si le callbackUrl n'est pas un chemin interne (garde anti-open-redirect)", async () => {
    const jsx = await LoginPage({
      searchParams: Promise.resolve({ callbackUrl: "https://evil.example/phish" }),
    });

    const form = findByType(jsx, LoginForm);
    expect(form?.props.callbackUrl).toBe("/dashboard");
  });
});
