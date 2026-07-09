/**
 * Dev-only flag gating dev tooling (e.g. the Theme Testing panel).
 * Stripped out of production builds: every consumer should gate on `isDev`,
 * so the dead-code branch never runs and panels don't ship to users.
 */
export const isDev = process.env.NODE_ENV === "development";
