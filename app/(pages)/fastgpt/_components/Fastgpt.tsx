'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import styles from './Fastgpt.module.scss';

// Interface for input form field
interface InputFormField {
  type: string;
  key: string;
  label: string;
  description: string;
  value: string;
  defaultValue: string;
  valueType: string;
  required: boolean;
  list: Array<{
    label: string;
    value: string;
  }>;
}

// Interface for interactive node data
interface InteractiveData {
  type: string;
  params: {
    description: string;
    inputForm?: InputFormField[];
    userSelectOptions?: Array<{
      value: string;
      key: string;
    }>;
  };
}

// FastGPT response interfaces
interface FastGptResponseChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
  type?: string;
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
  interactive?: InteractiveData;
}

export default function FastGptIntegrationPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<FastGptResponse | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // State for interactive mode
  const [chatId] = useState<string>(`web-${Date.now()}`);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveData, setInteractiveData] =
    useState<InteractiveData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {}
  );

  // Reset form values when interactive data changes
  useEffect(() => {
    if (interactiveData?.params?.inputForm) {
      const initialValues: Record<string, string | number> = {};
      interactiveData.params.inputForm.forEach((field) => {
        initialValues[field.key] = field.defaultValue || '';
      });
      setFormValues(initialValues);
    }
  }, [interactiveData]);

  const handleFormValueChange = (key: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Prepare the payload based on whether we're in interactive mode or not
      let payload;

      if (isInteractiveMode) {
        const serializedFormValues = JSON.stringify(formValues);
        console.log('Serialized form values:', serializedFormValues);
        // For interactive mode, serialize the form values as content
        payload = {
          chatId,
          userInput: JSON.stringify(formValues),
          isInteractive: true,
        };
      } else {
        // Standard initial request
        payload = {
          chatId,
          userInput,
          isInteractive: false,
        };
      }

      // Call our API route which will then call FastGPT
      console.log('Sending request to /api/fastgpt with payload:', payload);
      const response = await fetch('/api/fastgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

      // Check if this is an interactive response
      if (data.interactive) {
        setIsInteractiveMode(true);
        setInteractiveData(data.interactive);
      } else {
        // Reset interactive mode if we got a normal response
        setIsInteractiveMode(false);
        setInteractiveData(null);
      }
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
      // Ensure the content is a string
      const content = response.choices[0].message.content;
      return typeof content === 'string'
        ? content
        : JSON.stringify(content, null, 2);
    }

    // Return formatted JSON as fallback but filter out interactive property to avoid rendering issues
    const responseCopy = { ...response };
    // Remove interactive property if it exists to avoid rendering issues
    if ('interactive' in responseCopy) {
      delete responseCopy.interactive;
    }
    return JSON.stringify(responseCopy, null, 2);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Assistant</h1>
      <p className={styles.subtitle}>
        Ask a question and get an intelligent response powered by FastGPT
      </p>

      <div className={styles.cardContainer}>
        {!isInteractiveMode ? (
          // Regular input form
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
        ) : (
          // Interactive form based on FastGPT response
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <h3>Interactive Input</h3>
              {interactiveData?.params?.description && (
                <p className={styles.subtitle}>
                  {interactiveData.params.description}
                </p>
              )}

              {interactiveData?.params?.inputForm?.map((field) => (
                <div key={field.key} className={styles.formGroup}>
                  <label htmlFor={field.key} className={styles.formLabel}>
                    {field.label}{' '}
                    {field.required && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  {field.description && (
                    <p className={styles.subtitle}>{field.description}</p>
                  )}

                  {field.type === 'input' && (
                    <input
                      id={field.key}
                      type="text"
                      className={styles.textArea}
                      value={(formValues[field.key] as string) || ''}
                      onChange={(e) =>
                        handleFormValueChange(field.key, e.target.value)
                      }
                      required={field.required}
                    />
                  )}

                  {field.type === 'numberInput' && (
                    <input
                      id={field.key}
                      type="number"
                      className={styles.textArea}
                      value={(formValues[field.key] as number) || ''}
                      onChange={(e) =>
                        handleFormValueChange(field.key, Number(e.target.value))
                      }
                      required={field.required}
                    />
                  )}

                  {/* You can add support for more field types as needed */}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        )}

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
            <div className={styles.responseContent}>
              {isInteractiveMode
                ? 'Please complete the form above to continue.'
                : getResponseContent()}
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
