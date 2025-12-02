// PathGen Backend — Fortnite AI Coach
// Firebase Admin initialization for Next.js server-side

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  try {
    let initialized = false;

    // Option 1: Service account JSON from environment variable (recommended for Vercel and local)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Try to parse the JSON - handle both string and already-parsed objects
        let serviceAccount;
        if (typeof process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON === 'string') {
          // Remove any surrounding quotes or whitespace
          const jsonStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim();
          // Handle case where it might be double-encoded
          if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
            serviceAccount = JSON.parse(JSON.parse(jsonStr));
          } else {
            serviceAccount = JSON.parse(jsonStr);
          }
        } else {
          serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        }

        // Validate it's a service account object
        if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
          throw new Error('Invalid service account JSON: missing or incorrect type field');
        }
        if (!serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error('Invalid service account JSON: missing required fields');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('[INFO] Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS_JSON');
        initialized = true;
      } catch (parseError: any) {
        console.error('[ERROR] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', parseError.message);
        const jsonValue = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '';
        console.error('[ERROR] JSON value length:', jsonValue.length);
        console.error('[ERROR] First 200 chars:', jsonValue.substring(0, 200));
        console.error('[ERROR] Last 50 chars:', jsonValue.substring(Math.max(0, jsonValue.length - 50)));
        console.error('[ERROR] This usually means:');
        console.error('[ERROR]   1. The JSON is malformed (check for trailing commas, missing quotes)');
        console.error('[ERROR]   2. The JSON is double-encoded (has extra quotes or escapes)');
        console.error('[ERROR]   3. The JSON has line breaks that need to be escaped');
        console.error('[ERROR] Fix by: Running setup-local-firebase.ps1 or manually setting correct JSON in .env.local');
        // Continue to try other methods
      }
    }

    // Option 2: Service account file path (for local development)
    if (!initialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        // Handle both absolute and relative paths
        const fullPath = path.isAbsolute(credentialsPath)
          ? credentialsPath
          : path.join(process.cwd(), credentialsPath);

        if (fs.existsSync(fullPath)) {
          const serviceAccount = require(fullPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('[INFO] Firebase Admin initialized with service account file:', fullPath);
          initialized = true;
        } else {
          console.warn('[WARNING] Service account file not found:', fullPath);
        }
      } catch (fileError: any) {
        console.error('[ERROR] Failed to load service account file:', fileError.message);
      }
    }

    // Option 3: Try to find service account in common locations (local development)
    if (!initialized && process.env.NODE_ENV !== 'production') {
      const commonPaths = [
        path.join(process.cwd(), 'firebase-service-account.json'),
        path.join(process.cwd(), 'service-account.json'),
        path.join(process.cwd(), 'apps', 'web', 'firebase-service-account.json'),
        path.join(process.cwd(), 'apps', 'web', 'service-account.json'),
      ];

      for (const credPath of commonPaths) {
        if (fs.existsSync(credPath)) {
          try {
            const serviceAccount = require(credPath);
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
            console.log('[INFO] Firebase Admin initialized with service account file:', credPath);
            initialized = true;
            break;
          } catch (loadError: any) {
            console.warn('[WARNING] Failed to load service account from:', credPath, loadError.message);
          }
        }
      }
    }

    // Option 4: Use default credentials with project ID (works if Vercel has Google Cloud access)
    if (!initialized && process.env.FIREBASE_PROJECT_ID) {
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('[INFO] Firebase Admin initialized with project ID (default credentials)');
        initialized = true;
      } catch (defaultError: any) {
        console.warn('[WARNING] Failed to initialize with default credentials:', defaultError.message);
      }
    }

    // Option 5: Fallback (will likely fail but allows app to start)
    if (!initialized) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pathgen-v2';
      try {
        admin.initializeApp({
          projectId: projectId,
        });
        console.warn('[WARNING] Firebase Admin initialized with fallback project ID - may not have write permissions');
        console.warn('[WARNING] For local development, set GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local');
        initialized = true;
      } catch (fallbackError: any) {
        console.error('[ERROR] Failed to initialize Firebase Admin with fallback:', fallbackError.message);
        console.error('[ERROR] Please set GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local for local development');
      }
    }
  } catch (error: any) {
    // If already initialized, ignore
    if (!error.message?.includes('already initialized')) {
      console.error('[ERROR] Firebase Admin initialization error:', error);
      console.error('[ERROR] Error message:', error.message);
      console.error('[ERROR] Error stack:', error.stack);
      // Don't throw - will fail on first access if not initialized
    }
  }
}

// Initialize Firestore database
let db: admin.firestore.Firestore;
try {
  db = admin.firestore();
  console.log('[INFO] Firebase Admin Firestore initialized successfully');
} catch (error: any) {
  console.error('[ERROR] Failed to initialize Firestore:', error);
  // Create a placeholder to prevent import errors
  // Actual error will be caught when db is used
  db = admin.firestore();
}

export { db, admin };


