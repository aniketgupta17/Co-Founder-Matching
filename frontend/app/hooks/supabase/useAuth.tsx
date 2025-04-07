import { createClient, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSupabase } from "./useSupabase";

export interface Credentials {
  email: string;
  password: string;
}

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
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
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
  }, []);

  const signIn = async (credentials: Credentials) => {
    setLoading(false);
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
