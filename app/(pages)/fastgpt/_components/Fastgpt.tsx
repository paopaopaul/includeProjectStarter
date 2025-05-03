'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
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

// Message interfaces
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Record<string, any>;
  timestamp?: number;
}

// Interactive form message
interface InteractiveFormMessage extends Message {
  isInteractive: true;
  interactiveData: InteractiveData;
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

export default function FastGptChatInterface() {
  // Chat state
  const [messages, setMessages] = useState<
    (Message | InteractiveFormMessage)[]
  >([
    {
      role: 'system',
      content: 'Welcome! Ask me anything or request a service.',
      timestamp: Date.now(),
    },
  ]);

  // Input state
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive form state
  const [chatId] = useState<string>(`web-${Date.now()}`);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveData, setInteractiveData] =
    useState<InteractiveData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {}
  );

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when page loads
  useEffect(() => {
    if (inputRef.current && !isInteractiveMode) {
      inputRef.current.focus();
    }
  }, [isInteractiveMode]);

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

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle form value changes
  const handleFormValueChange = (key: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle sending a message
  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Don't send empty messages
    const inputToSend = isInteractiveMode ? formValues : userInput.trim();
    if (
      (!isInteractiveMode && !userInput.trim()) ||
      (isInteractiveMode && Object.keys(formValues).length === 0)
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      if (!isInteractiveMode) {
        const newUserMessage: Message = {
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setUserInput('');
      } else {
        // For interactive mode, add a message showing the form values
        const formSummary = Object.entries(formValues)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        const newUserMessage: Message = {
          role: 'user',
          content: `Form submitted:\n${formSummary}`,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
      }

      // Prepare payload for API
      let payload;

      if (isInteractiveMode) {
        // For interactive mode, serialize the form values to a JSON string
        const serializedFormValues = JSON.stringify(formValues);
        console.log('Serialized form values:', serializedFormValues);

        payload = {
          chatId,
          userInput: serializedFormValues,
          isInteractive: true,
        };
      } else {
        // Standard initial request
        payload = {
          chatId,
          userInput: userInput.trim(),
          isInteractive: false,
        };
      }

      // Call our API route
      console.log('Sending request to /api/fastgpt with payload:', payload);
      const response = await fetch('/api/fastgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data: FastGptResponse = await response.json();
      console.log('FastGPT response:', data);

      // Handle the response
      if (data.interactive) {
        // Handle interactive response
        setIsInteractiveMode(true);
        setInteractiveData(data.interactive);

        // Add an interactive message
        const interactiveMessage: InteractiveFormMessage = {
          role: 'assistant',
          content:
            data.interactive.params.description || 'Please fill out this form:',
          isInteractive: true,
          interactiveData: data.interactive,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, interactiveMessage]);
      } else {
        // Handle normal response
        setIsInteractiveMode(false);
        setInteractiveData(null);

        // Extract response content
        let responseContent = '';
        if (data.choices && data.choices[0]?.message?.content) {
          responseContent = data.choices[0].message.content;
        } else {
          responseContent =
            'I received your message but could not generate a proper response.';
        }

        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content:
            typeof responseContent === 'string'
              ? responseContent
              : JSON.stringify(responseContent),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);

      // Add error message
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      // Add error as system message
      const systemMessage: Message = {
        role: 'system',
        content: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, systemMessage]);
    } finally {
      setIsLoading(false);
      // Reset form mode if we're done with interactive mode
      if (!isInteractiveMode) {
        setFormValues({});
      }
    }
  };

  // Handle textarea input (allow sending with Enter, but Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setUserInput(textarea.value);

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Render a chat message
  const renderMessage = (
    message: Message | InteractiveFormMessage,
    index: number
  ) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isInteractiveMessage =
      'isInteractive' in message && message.isInteractive;

    return (
      <div
        key={index}
        className={`${styles.messageWrapper} ${
          isUser
            ? styles.userMessage
            : isSystem
            ? styles.systemMessage
            : styles.assistantMessage
        }`}
      >
        <div className={styles.messageBubble}>
          {isUser && <div className={styles.messageAuthor}>You</div>}
          {!isUser && !isSystem && (
            <div className={styles.messageAuthor}>AI Assistant</div>
          )}

          <div className={styles.messageContent}>
            {isInteractiveMessage ? (
              <div className={styles.interactiveForm}>
                <p>{message.content}</p>
                {message.interactiveData.params.inputForm && (
                  <form
                    className={styles.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    {message.interactiveData.params.inputForm.map((field) => (
                      <div key={field.key} className={styles.formField}>
                        <label htmlFor={field.key} className={styles.formLabel}>
                          {field.label}{' '}
                          {field.required && (
                            <span className={styles.required}>*</span>
                          )}
                        </label>

                        {field.description && (
                          <p className={styles.fieldDescription}>
                            {field.description}
                          </p>
                        )}

                        {field.type === 'input' && (
                          <input
                            id={field.key}
                            type="text"
                            className={styles.formInput}
                            value={(formValues[field.key] as string) || ''}
                            onChange={(e) =>
                              handleFormValueChange(field.key, e.target.value)
                            }
                            required={field.required}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}

                        {field.type === 'numberInput' && (
                          <input
                            id={field.key}
                            type="number"
                            className={styles.formInput}
                            value={(formValues[field.key] as number) || ''}
                            onChange={(e) =>
                              handleFormValueChange(
                                field.key,
                                Number(e.target.value)
                              )
                            }
                            required={field.required}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}

                        {/* Add other field types as needed */}
                      </div>
                    ))}

                    <button
                      type="submit"
                      className={styles.formSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </form>
                )}

                {message.interactiveData.params.userSelectOptions && (
                  <div className={styles.selectOptions}>
                    {message.interactiveData.params.userSelectOptions.map(
                      (option) => (
                        <button
                          key={option.key}
                          className={styles.selectOption}
                          onClick={() => {
                            // Handle selection option
                            setFormValues({ [option.key]: option.value });
                            handleSendMessage();
                          }}
                          disabled={isLoading}
                        >
                          {option.value}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.textContent}>
                {
                  typeof message.content === 'string'
                    ? message.content.split('\n').map((line, i) => (
                        <p key={i}>{line || '\u00A0'}</p> // Use non-breaking space for empty lines
                      ))
                    : JSON.stringify(message.content) // Handle non-string content
                }
              </div>
            )}
          </div>

          {message.timestamp && (
            <div className={styles.messageTimestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h1>AI Assistant</h1>
        <Link href="/" className={styles.homeLink}>
          ← Home
        </Link>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} /> {/* Scroll anchor */}
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className={styles.dismissButton}
          >
            Dismiss
          </button>
        </div>
      )}

      {!isInteractiveMode && (
        <form className={styles.inputForm} onSubmit={handleSendMessage}>
          <div className={styles.inputWrapper}>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className={styles.messageInput}
              disabled={isLoading}
              rows={1}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className={styles.inputHint}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      )}
    </div>
  );
}
