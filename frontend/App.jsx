import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sidebar, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const LOADING_TEXTS = [
  "Guessing mode: activated...",
  "Hmm, let me think...",
  "Processing your clue...",
  "Analyzing possibilities...",
  "Running through my vocabulary...",
  "Almost got it...",
  "Narrowing it down...",
  "This is a tough one...",
  "Connecting the dots...",
  "Searching my brain...",
];

const App = () => {
  const [messages, setMessages] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("acmai-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0
          ? parsed
          : [
              {
                role: "assistant",
                content:
                  "Welcome to ACM AI. Ready to challenge me for a prompt war?",
              },
            ];
      } catch (e) {
        return [
          {
            role: "assistant",
            content: "Welcome to ACM AI. Ready to challenge me for a prompt war?",
          },
        ];
      }
    }
    return [
      {
        role: "assistant",
        content: "Welcome to ACM AI. Ready to challenge me for a prompt war?",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("acmai-chat-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  const scrollRef = useRef(null);

  // Cycle through loading texts randomly while loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setLoadingText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowHistory(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("acmai-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  const saveChatSession = () => {
    if (messages.length > 1) {
      const session = {
        id: Date.now(),
        title:
          messages.find((m) => m.role === "user")?.content?.substring(0, 50) ||
          "New Chat",
        messages: messages,
        timestamp: new Date().toISOString(),
      };
      const updated = [session, ...chatHistory].slice(0, 20); // Keep last 20 sessions
      setChatHistory(updated);
      localStorage.setItem("acmai-chat-sessions", JSON.stringify(updated));
    }
  };

  const loadChatSession = (session) => {
    setMessages(session.messages);
    setShowHistory(false);
  };

  const clearCurrentChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Welcome to ACM AI. Ready to challenge me for a prompt war?",
      },
    ]);
    localStorage.removeItem("acmai-chat-history");
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const updated = chatHistory.filter((s) => s.id !== id);
    setChatHistory(updated);
    localStorage.setItem("acmai-chat-sessions", JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const prompt = input; // store input safely

    const userMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoadingText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json(); // read once

      if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      // Auto-save session after getting response
      setTimeout(saveChatSession, 500);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Connection error. Make sure backend is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Animated Background Gradient */}
      <div className="bg-gradient-1" />
      <div className="bg-gradient-2" />
      <div className="bg-gradient-3" />

      {/* Glassmorphism Overlay Pattern */}
      <div className="glass-pattern" />

      {/* Sidebar Menu Button */}
      <button
        className="sidebar-menu-button"
        onClick={() => setShowHistory(!showHistory)}
        title="Menu"
      >
        <Sidebar size={38} />
      </button>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="header-glass">
          <h1 className="app-title">ACM AI</h1>
          {messages.length > 1 && (
            <button
              className="clear-button"
              onClick={clearCurrentChat}
              title="Clear Chat"
            >
              <X size={44} />
            </button>
          )}
        </header>

        {/* Chat Container with Glassmorphism */}
        <main className="chat-container">
          {/* Chat Messages Area */}
          <div className="messages-area">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-wrapper ${
                  msg.role === "user" ? "message-user" : "message-assistant"
                }`}
              >
                <div
                  className={`message-content ${
                    msg.role === "user"
                      ? "message-user-content"
                      : "message-assistant-content"
                  }`}
                >
                  <div
                    className={`message-avatar ${
                      msg.role === "user" ? "avatar-user" : "avatar-assistant"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={22} />
                    ) : (
                      <Bot size={22} />
                    )}
                  </div>
                  <div
                    className={`message-bubble ${
                      msg.role === "user" ? "bubble-user" : "bubble-assistant"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="message-text markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="markdown-p">{children}</p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="markdown-h1">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="markdown-h2">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="markdown-h3">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="markdown-ul">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="markdown-ol">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="markdown-li">{children}</li>
                            ),
                            code: ({ inline, children, ...props }) =>
                              inline ? (
                                <code
                                  className="markdown-code-inline"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className="markdown-code-block"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ),
                            pre: ({ children }) => (
                              <pre className="markdown-pre">{children}</pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="markdown-blockquote">
                                {children}
                              </blockquote>
                            ),
                            strong: ({ children }) => (
                              <strong className="markdown-strong">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="markdown-em">{children}</em>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="markdown-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="message-text">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="loading-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">{loadingText}</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area with Glassmorphism */}
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Ask me anything..."
                className="chat-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="send-button"
              >
                <Send size={24} className="send-icon" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Chat History Sidebar - Left Side */}
      {showHistory && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setShowHistory(false)}
          ></div>
          <div className="history-sidebar">
            <div className="history-header">
              <h2>Chat History</h2>
              <button
                className="close-history"
                onClick={() => setShowHistory(false)}
              >
                <X size={100} />
              </button>
            </div>
            <div className="history-list">
              {chatHistory.length === 0 ? (
                <div className="history-empty">No saved chats yet</div>
              ) : (
                chatHistory.map((session) => (
                  <div
                    key={session.id}
                    className="history-item"
                    onClick={() => loadChatSession(session)}
                  >
                    <div className="history-item-content">
                      <div className="history-item-title">'{session.title}'</div>
                      <div className="history-item-time">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      className="history-item-delete"
                      onClick={(e) => deleteSession(session.id, e)}
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
