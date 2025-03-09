'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import styles from './Fastgpt.module.scss';

// Define FastGPT response interface based on the API documentation
interface FastGptResponseChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

interface FastGptResponse {
  id?: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices?: FastGptResponseChoice[];
}

export default function FastGptIntegrationPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<FastGptResponse | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Call our own API route which will then call FastGPT
      console.log('Sending request to /api/fastgpt');
      const response = await fetch('/api/fastgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
        }),
      });

      // Get the full response regardless of status code
      const responseText = await response.text();
      let data;

      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (e) {
        // If not valid JSON, show the raw text for debugging
        setDebugInfo(`Raw API response (not valid JSON): ${responseText}`);
        throw new Error('Invalid response format from API');
      }

      if (!response.ok) {
        console.error('Error details:', data);
        throw new Error(
          data.error || `API request failed with status ${response.status}`
        );
      }

      console.log('FastGPT response:', data);
      setResponse(data);
    } catch (err) {
      console.error('Error calling API:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Extract FastGPT response content
  const getResponseContent = (): string => {
    if (!response) return '';

    // Try different response formats based on FastGPT documentation
    if (response.choices && response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }

    // Return formatted JSON as fallback
    return JSON.stringify(response, null, 2);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Assistant</h1>
      <p className={styles.subtitle}>
        Ask a question and get an intelligent response powered by FastGPT
      </p>

      <div className={styles.cardContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="userInput" className={styles.formLabel}>
              Ask a question or provide some text to analyze
            </label>
            <textarea
              id="userInput"
              rows={4}
              className={styles.textArea}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your question here..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className={styles.submitButton}
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorTitle}>Error</p>
            <p>{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className={styles.errorContainer}>
            <p className={styles.errorTitle}>Debug Information</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {debugInfo}
            </pre>
          </div>
        )}

        {response && (
          <div className={styles.responseContainer}>
            <h2 className={styles.responseTitle}>Response:</h2>
            <div className={styles.responseContent}>{getResponseContent()}</div>
          </div>
        )}
      </div>

      <div className={styles.homeLink}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}
