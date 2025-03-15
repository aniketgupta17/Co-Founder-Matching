import { useState, useEffect } from 'react';
import axios from 'axios';

// Adjust this to match your local or hosted backend URL
const BASE_URL = 'http://localhost:8000/api';

export function useMockApi(endpoint: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/${endpoint}`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}