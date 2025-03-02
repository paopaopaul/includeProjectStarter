'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Fastgpt.module.scss';

export default function FastGptIntegrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  interface FastGptResponse {
    choices?: { message?: { content?: string } }[];
  }

  const [response, setResponse] = useState<FastGptResponse | null>(null);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our own API route which will then call FastGPT
      const response = await fetch('/api/fastgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
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

        {response && (
          <div className={styles.responseContainer}>
            <h2 className={styles.responseTitle}>Response:</h2>
            <div className={styles.responseContent}>
              {response.choices?.[0]?.message?.content ||
                JSON.stringify(response, null, 2)}
            </div>
          </div>
        )}
      </div>

      <div className={styles.homeLink}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}
