import { createClient, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSupabase } from "./useSupabase";
import { Credentials } from "types/auth";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { supabase, USE_MOCK_AUTH } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    // If using mock auth, start with no session to show the welcome screen
    if (USE_MOCK_AUTH) {
      console.log("Using mock authentication - no initial session");
      // Start with no session so welcome/login screens will appear
      setSession(null);
      setUser(null);
      return;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log(`Error refreshing session: ${error}`);
      return;
    }

    setSession(session);
    setUser(session?.user || null);
  };

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      await refreshSession();
      setLoading(false);
    };

    getInitialSession();

    // Only set up auth state change listener if not using mock auth
    if (!USE_MOCK_AUTH) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (credentials: Credentials) => {
    setLoading(true);
    
    // Use mock auth if enabled
    if (USE_MOCK_AUTH) {
      console.log("Mock sign in with:", credentials.email);
      // Create a mock session when user signs in
      const mockUser = {
        id: "mock-user-id",
        email: credentials.email,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockSession = {
        access_token: "mock-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        expires_at: new Date().getTime() + 3600000,
        token_type: "bearer",
        user: mockUser,
      } as Session;
      
      setSession(mockSession);
      setUser(mockUser);
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      console.log(`Sign in error: ${error}`);
      throw error;
    }
    setLoading(false);
  };

  const signUp = async (credentials: Credentials) => {
    setLoading(true);
    
    // Use mock auth if enabled
    if (USE_MOCK_AUTH) {
      console.log("Mock sign up with:", credentials.email);
      // Create a mock session when user signs up
      const mockUser = {
        id: "mock-user-id",
        email: credentials.email,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockSession = {
        access_token: "mock-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        expires_at: new Date().getTime() + 3600000,
        token_type: "bearer",
        user: mockUser,
      } as Session;
      
      setSession(mockSession);
      setUser(mockUser);
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      console.log(`Sign up error: ${error}`);
      throw error;
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    
    // Use mock auth if enabled
    if (USE_MOCK_AUTH) {
      console.log("Mock sign out");
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setLoading(false);
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used with an AuthProvider");
  }

  return context;
}
