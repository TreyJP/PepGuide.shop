import { type Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type Functions, getFunctions } from 'firebase/functions';

import { useMockServices } from '@/src/utils/env';

// Next.js only inlines NEXT_PUBLIC_* when accessed as static property paths.
// Dynamic process.env[name] stays undefined in the browser and silently forces mock auth.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functionsClient: Functions | null = null;
let analytics: Analytics | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export function shouldUseMockServices(): boolean {
  return useMockServices() || !isFirebaseConfigured();
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;
  if (app) return app;

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

export function getFirebaseFunctions(): Functions | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!functionsClient) functionsClient = getFunctions(firebaseApp);
  return functionsClient;
}

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (analytics) return analytics;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  analytics = getAnalytics(firebaseApp);
  return analytics;
}
