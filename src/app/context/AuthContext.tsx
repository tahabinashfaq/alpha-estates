"use client";
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, signOut, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { app } from "../../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth(app);

  useEffect(() => {
    // Set persistence to LOCAL to keep user logged in across browser sessions
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("Firebase auth persistence set to LOCAL");
      } catch (err) {
        console.error("Failed to set Firebase auth persistence:", err);
        setError("Failed to initialize authentication");
      }
    };

    initializeAuth();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User logged in" : "User logged out");
        setUser(firebaseUser);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError("Authentication error occurred");
        setLoading(false);
      }
    ); return () => {
      console.log("Auth listener cleanup");
      unsubscribe();
    };
  }, [auth]);

  // Additional check for session validity
  useEffect(() => {
    if (user) {
      // Verify token is still valid every 5 minutes
      const interval = setInterval(async () => {
        try {
          await user.getIdToken(true); // Force refresh
          console.log("Token refreshed successfully");
        } catch (err) {
          console.error("Token refresh failed:", err);
          setError("Session expired, please login again");
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to sign out");
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
