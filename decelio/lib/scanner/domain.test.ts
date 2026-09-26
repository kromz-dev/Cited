import { describe, expect, it } from "vitest";
import { domainToScanUrl, isValidDomainName } from "./domain";

describe("isValidDomainName", () => {
  it("accepts a plain domain", () => {
    expect(isValidDomainName("example.com")).toBe(true);
  });

  it("accepts a subdomain with a multi-part TLD", () => {
    expect(isValidDomainName("www.example.co.uk")).toBe(true);
  });

  it("accepts uppercase input by treating it case-insensitively", () => {
    expect(isValidDomainName("Example.COM")).toBe(true);
  });

  it("accepts a domain with surrounding whitespace", () => {
    expect(isValidDomainName("  example.com  ")).toBe(true);
  });

  it("rejects a full URL with a scheme", () => {
    expect(isValidDomainName("https://example.com")).toBe(false);
  });

  it("rejects a domain with a path", () => {
    expect(isValidDomainName("example.com/path")).toBe(false);
  });

  it("rejects a domain with a port", () => {
    expect(isValidDomainName("example.com:8080")).toBe(false);
  });

  it("rejects a single-label hostname with no TLD", () => {
    expect(isValidDomainName("localhost")).toBe(false);
  });

  it("rejects a dotted IPv4 address (no alphabetic TLD)", () => {
    expect(isValidDomainName("127.0.0.1")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidDomainName("")).toBe(false);
  });

  it("rejects a domain containing a space", () => {
    expect(isValidDomainName("exa mple.com")).toBe(false);
  });

  it("rejects a label that starts with a hyphen", () => {
    expect(isValidDomainName("-example.com")).toBe(false);
  });
});

describe("domainToScanUrl", () => {
  it("prefixes the domain with https", () => {
    expect(domainToScanUrl("example.com")).toBe("https://example.com");
  });

  it("lowercases and trims before building the URL", () => {
    expect(domainToScanUrl("  Example.COM  ")).toBe("https://example.com");
  });
});
