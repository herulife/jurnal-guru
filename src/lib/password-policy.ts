export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;

export function validatePasswordForCreation(password: unknown): string | null {
  if (typeof password !== "string") {
    return "Password wajib diisi";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter`;
  }
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return `Password maksimal ${MAX_PASSWORD_BYTES} byte (UTF-8)`;
  }
  return null;
}