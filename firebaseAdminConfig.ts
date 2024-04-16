// Import the Firebase Admin SDK
import * as admin from 'firebase-admin';

// Ensure environment variables are loaded (not needed if using Next.js or you have a loader like dotenv)
// import dotenv from 'dotenv';
// dotenv.config();

// Check if Firebase app has been initialized
if (admin.apps.length === 0) { // Ensures no duplicate app initialization
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace escaped newlines
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const db = admin.database();
