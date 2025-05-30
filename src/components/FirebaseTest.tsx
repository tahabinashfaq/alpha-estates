"use client";
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

export function FirebaseTest() {
  const auth = getAuth(app);

  const testConnection = () => {
    console.log('Firebase App:', app);
    console.log('Firebase Auth:', auth);
    console.log('Auth Config:', auth.config);
    console.log('Current User:', auth.currentUser);

    // Test if we can access Firebase services
    try {
      console.log('Firebase project ID:', auth.app.options.projectId);
      console.log('Firebase API key exists:', !!auth.app.options.apiKey);
      console.log('Firebase auth domain:', auth.app.options.authDomain);
    } catch (error) {
      console.error('Firebase configuration error:', error);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg mt-4">
      <h3 className="text-lg font-bold mb-2">Firebase Connection Test</h3>
      <button
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Firebase Connection
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Check the browser console for connection details.
      </p>
    </div>
  );
}
