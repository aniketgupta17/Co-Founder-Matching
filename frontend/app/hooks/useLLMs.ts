import { useState } from 'react';
import axios from 'axios';

// Hypothetical usage of your FastAPI back end + OpenAI
// Or direct usage of OpenAI with a token from env if you do it in the client
export function useLLM() {
  const [response, setResponse] = useState('');

  async function queryLLM(prompt: string) {
    // Example: calling your back-end route
    try {
      const result = await axios.post('https://your-backend/api/llm', {
        prompt,
      });
      setResponse((result.data as { answer: string }).answer);
    } catch (error) {
      console.error('LLM error:', error);
    }
  }

  return { response, queryLLM };
}