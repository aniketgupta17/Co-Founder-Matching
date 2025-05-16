import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "./supabase";

export const useApi = <
  T extends (accessToken: string | null, ...args: any[]) => Promise<any>
>(
  apiRequest: T
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState(null);
  const { supabase } = useSupabase();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setAccessToken(sessionData.session?.access_token ?? null);
    };
    getToken();
  }, [supabase]);

  const submit = useCallback(
    async (
      ...args: Parameters<T> extends [string | null, ...infer Rest]
        ? Rest
        : never
    ) => {
      if (!accessToken) {
        console.log("Access Token not yet available");
        return; // Optionally, return early or handle a loading state
      }

      try {
        setLoading(true);
        console.log(`Access Token: ${accessToken}`);
        const resp = await apiRequest(accessToken, ...args);
        setData(resp);
      } catch (e: any) {
        setErrors(e);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, apiRequest]
  );

  return {
    loading,
    data,
    errors,
    submit,
  };
};
