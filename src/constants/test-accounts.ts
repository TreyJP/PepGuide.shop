/**
 * Internal / QA accounts that should not count as paid Pro revenue
 * in admin metrics, and show as “Test account” in the Users roster.
 */
export const TEST_ACCOUNT_EMAILS = [
  'treyprestholt2345@gmail.com',
] as const;

export function isTestAccountEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (TEST_ACCOUNT_EMAILS as readonly string[]).some(
    (item) => item.toLowerCase() === normalized,
  );
}
