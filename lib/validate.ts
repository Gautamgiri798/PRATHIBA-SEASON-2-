export type ContactType = "mobile" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an Indian mobile number to a bare 10-digit string.
 * Strips spaces, dashes, and an optional +91 / 91 / 0 prefix.
 * Returns null if the result isn't a plausible 10-digit mobile number.
 */
export function normalizeMobile(raw: string): string | null {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return null;
  return trimmed;
}

export function normalizeContact(
  raw: string,
  type: ContactType
): string | null {
  return type === "mobile" ? normalizeMobile(raw) : normalizeEmail(raw);
}
