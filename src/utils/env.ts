/**
 * Mock services are OFF unless explicitly enabled.
 * (Previously defaulted ON when unset, which broke production chat auth.)
 */
export function useMockServices(): boolean {
  const value = process.env.NEXT_PUBLIC_USE_MOCK_SERVICES?.trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}
