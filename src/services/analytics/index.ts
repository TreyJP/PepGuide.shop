type AnalyticsParams = Record<string, string | number | boolean | undefined>;

const SENSITIVE_KEYS = [
  'message',
  'content',
  'prompt',
  'chat',
  'conversation',
  'email',
  'password',
];

function sanitize(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!params) return undefined;
  const clean: AnalyticsParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      return;
    }
    clean[key] = value;
  });
  return clean;
}

export const analyticsService = {
  logEvent(name: string, params?: AnalyticsParams) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[analytics]', name, sanitize(params));
    }
  },
  setUserProperty(name: string, value: string) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[analytics:user]', name, value);
    }
  },
};
