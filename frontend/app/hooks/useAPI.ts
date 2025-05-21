import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "./supabase";

export const useApi = <
  T extends (accessToken: string | null, ...args: any[]) => Promise<any>
>(
  apiRequest: T
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<T>> | null>(null);
  const [errors, setErrors] = useState<Error | null>(null);
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
        return;
      }

      try {
        setLoading(true);
        console.log("Request with token:", accessToken);
        const resp = await apiRequest(accessToken, ...args);
        setData(resp);
        setErrors(null);
        return resp;
      } catch (e: any) {
        console.error("error", e);
        setErrors(e);
        throw e; // Re-throw to allow error handling in the calling component
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
