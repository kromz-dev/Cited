import { describe, expect, it } from "vitest";
import { buildAlertChannels } from "./alerts-summary";

describe("buildAlertChannels", () => {
  it("shows the real account e-mail as the only available channel", () => {
    const channels = buildAlertChannels("laura@example.com");

    expect(channels).toHaveLength(3);
    expect(channels[0]).toEqual({
      id: "email",
      label: "E-mail",
      detail: "laura@example.com",
      available: true,
    });
    expect(channels[1].available).toBe(false);
    expect(channels[2].available).toBe(false);
  });

  it("falls back to a neutral label when the account e-mail is unknown", () => {
    const channels = buildAlertChannels(null);

    expect(channels[0].detail).toBe("Adresse e-mail du compte");
  });

  it("never marks Slack or the webhook as available", () => {
    const channels = buildAlertChannels("someone@example.com");
    const slack = channels.find((c) => c.id === "slack");
    const webhook = channels.find((c) => c.id === "webhook");

    expect(slack?.available).toBe(false);
    expect(slack?.detail).toBe("Pas encore proposé");
    expect(webhook?.available).toBe(false);
    expect(webhook?.detail).toBe("Pas encore proposé");
  });
});
