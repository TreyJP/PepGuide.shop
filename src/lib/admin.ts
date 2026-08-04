/** Comma-separated admin emails from env (client-safe bootstrap list). */
export function getEnvAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnvAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getEnvAdminEmails().includes(email.trim().toLowerCase());
}
