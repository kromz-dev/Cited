/** Shared-database throttle for password-reset requests: five attempts per IP and fixed hour. */
export const RESET_REQUEST_LIMIT_PER_HOUR = 5;
export const RESET_REQUEST_WINDOW_MS = 60 * 60 * 1000;

/** Shared-database throttle for password-reset confirmations: ten attempts per IP and fixed hour. */
export const RESET_CONFIRM_LIMIT_PER_HOUR = 10;
export const RESET_CONFIRM_WINDOW_MS = 60 * 60 * 1000;
