'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Fastgpt.module.scss';

// 过滤不需要的字段
const filterMemoryEdges = (obj: any): any => {
  if (!obj) return obj;

  if (Array.isArray(obj)) {
    return obj.map(filterMemoryEdges);
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (key !== 'memoryEdges') {
        result[key] = filterMemoryEdges(obj[key]);
      }
    }
    return result;
  }

  return obj;
};

// 接口定义
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | any;
  timestamp?: number;
}

interface FormField {
  type: string;
  key: string;
  label: string;
  description: string;
  value: string;
  defaultValue: string;
  valueType: string;
  required: boolean;
  list?: Array<{ label: string; value: string }>;
}

// 主组件
export default function FastGptChat() {
  // 基本状态
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome! How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表单相关状态
  const [chatId, setChatId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formDescription, setFormDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 调试状态
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初始化焦点
  useEffect(() => {
    if (!showForm) {
      inputRef.current?.focus();
    }
  }, [showForm, isLoading]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // 处理表单字段变化
  const handleFormValueChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理 API 响应中的表单数据
  const processFormData = (data: any) => {
    console.log('PROCESSING DATA:', typeof data);

    // 递归查找具有 'interactive' 键的对象
    const findInteractive = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return null;

      if ('interactive' in obj) {
        console.log('FOUND INTERACTIVE');
        return obj.interactive;
      }

      if (Array.isArray(obj)) {
        for (const item of obj) {
          const result = findInteractive(item);
          if (result) return result;
        }
      } else {
        for (const key in obj) {
          const result = findInteractive(obj[key]);
          if (result) return result;
        }
      }

      return null;
    };

    // 深度搜索交互式数据
    const formData = findInteractive(data);
    console.log('FORM DATA FOUND:', formData);

    // 如果找到表单数据，提取字段
    if (formData && formData.params) {
      console.log('EXTRACTING FORM FIELDS');
      const description =
        formData.params.description || 'Please fill out this form:';
      const inputForm = formData.params.inputForm;

      console.log('DESCRIPTION:', description);

      if (inputForm && Array.isArray(inputForm) && inputForm.length > 0) {
        console.log('FORM FIELDS FOUND:', inputForm.length);

        // 设置表单数据
        setFormDescription(description);
        setFormFields(inputForm);

        // 初始化表单值
        const initialValues: Record<string, string> = {};
        inputForm.forEach((field) => {
          initialValues[field.key] = field.defaultValue || '';
        });
        setFormValues(initialValues);

        // 显示表单
        setShowForm(true);
        setDebugInfo(`Form with ${inputForm.length} fields ready to display`);

        return true;
      } else {
        console.warn('NO VALID FORM FIELDS FOUND');
        setDebugInfo('No valid form fields found');
      }
    } else {
      console.warn('NO FORM DATA OR PARAMS FOUND');
      setDebugInfo('No form data or params found');
    }

    return false;
  };

  // 发送消息
  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    // 表单模式
    if (showForm) {
      setDebugInfo('Processing form submission...');

      // 验证所有必填字段
      const missingRequired = formFields.filter(
        (field) => field.required && !formValues[field.key]?.trim()
      );

      if (missingRequired.length > 0) {
        const errorMsg = `Please fill in the required fields: ${missingRequired
          .map((f) => f.label)
          .join(', ')}`;
        setError(errorMsg);
        setDebugInfo(errorMsg);
        return;
      }

      setError(null);

      // 添加表单提交消息
      const formSummary = Object.entries(formValues)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: `Form submitted:\n${formSummary}`,
          timestamp: Date.now(),
        },
      ]);

      // 准备发送表单数据
      setIsLoading(true);

      try {
        // 将表单值序列化为 JSON 字符串
        const serializedFormValues = JSON.stringify(formValues);
        console.log('FORM VALUES SERIALIZED:', serializedFormValues);

        const response = await fetch('/api/fastgpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId,
            userInput: serializedFormValues,
            isInteractive: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('FORM SUBMISSION RESPONSE:', filterMemoryEdges(data));

        // 处理响应
        let responseContent = '';
        if (data.choices && data.choices[0]?.message?.content) {
          responseContent = data.choices[0].message.content;
        } else {
          responseContent = JSON.stringify(filterMemoryEdges(data), null, 2);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: responseContent,
            timestamp: Date.now(),
          },
        ]);

        // 清空表单
        setFormValues({});
        setShowForm(false);
        setDebugInfo('Form processed successfully');
      } catch (err) {
        console.error('Error submitting form:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDebugInfo(
          `Form submission error: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );

        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: `Error: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // 普通聊天模式
    if (!input.trim()) return;

    // 添加用户消息
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: input,
        timestamp: Date.now(),
      },
    ]);

    setInput('');
    setIsLoading(true);
    setDebugInfo('Sending message to API...');

    try {
      // 准备 API 请求
      const payload = {
        chatId: chatId || undefined,
        userInput: input.trim(),
        isInteractive: false,
      };

      const response = await fetch('/api/fastgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API RESPONSE:', data);
      setDebugInfo('Response received, processing...');

      // 保存 chatId
      if (data.id && !chatId) {
        setChatId(data.id);
        console.log('CHAT ID SET:', data.id);
      }

      // 处理响应中的表单数据
      const hasForm = processFormData(data);

      // 如果没有表单，显示普通响应
      if (hasForm) {
        setDebugInfo('Found form in response, waiting for user input');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: formDescription,
            timestamp: Date.now(),
          },
        ]);

        return;
      } else {
        setDebugInfo('No form found, showing regular response');
        // 如果处理了表单，添加表单提示消息
        const responseContent =
          data.choices?.[0]?.message?.content ||
          JSON.stringify(filterMemoryEdges(data), null, 2);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: responseContent,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDebugInfo(
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `Error: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化时间戳为可读时间
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h1>AI Assistant</h1>
        <p>Powered by FastGPT</p>
        <Link href="/" className={styles.homeLink}>
          ← Home
        </Link>
      </div>

      {debugInfo && (
        <div className={styles.debugInfo}>
          <span>{debugInfo}</span>
          <button
            onClick={() => setDebugInfo(null)}
            className={styles.clearButton}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.messagesContainer}>
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isSystem = message.role === 'system';
          return (
            <div
              key={index}
              className={`${styles.messageWrapper} ${
                isUser
                  ? styles.userMessageWrapper
                  : isSystem
                  ? styles.systemMessageWrapper
                  : styles.assistantMessageWrapper
              }`}
            >
              <div
                className={`${styles.messageBubble} ${
                  isUser
                    ? styles.userMessage
                    : isSystem
                    ? styles.systemMessage
                    : styles.assistantMessage
                }`}
              >
                {typeof message.content === 'string' ? (
                  message.content
                    .split('\n')
                    .map((line, i) => <p key={i}>{line || ' '}</p>)
                ) : (
                  <pre className={styles.codeBlock}>
                    {JSON.stringify(
                      filterMemoryEdges(message.content),
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
              {message.timestamp && (
                <div className={styles.messageTime}>
                  {formatTimestamp(message.timestamp)}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div
            className={`${styles.messageWrapper} ${styles.assistantMessageWrapper}`}
          >
            <div
              className={`${styles.messageBubble} ${styles.assistantMessage} ${styles.typingIndicator}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.clearButton}>
            ×
          </button>
        </div>
      )}

      {showForm ? (
        <div className={styles.formContainer}>
          <h3 className={styles.formTitle}>{formDescription}</h3>
          <form onSubmit={handleSendMessage} className={styles.form}>
            {formFields.map((field) => (
              <div key={field.key} className={styles.formField}>
                <label className={styles.formLabel}>
                  {field.label}{' '}
                  {field.required && <span className={styles.required}>*</span>}
                </label>
                {field.description && (
                  <p className={styles.fieldDescription}>{field.description}</p>
                )}
                <input
                  type={field.type === 'numberInput' ? 'number' : 'text'}
                  value={formValues[field.key] || ''}
                  onChange={(e) =>
                    handleFormValueChange(field.key, e.target.value)
                  }
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className={styles.formInput}
                />
              </div>
            ))}

            <div className={styles.formButtons}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowForm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className={styles.messageInput}
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );
}
