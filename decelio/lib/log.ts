export function logFailure(event: string, details: Record<string, string | number | boolean | null> = {}) {
  console.error(JSON.stringify({
    level: "error",
    event,
    ...details,
    at: new Date().toISOString(),
  }));
}
