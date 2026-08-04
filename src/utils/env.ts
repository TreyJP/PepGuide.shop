export function useMockServices(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_SERVICES !== 'false';
}
