"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";

function simpleMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang ? `<span style="color:var(--text-muted);font-size:9px;letter-spacing:0.1em">${lang.toUpperCase()}</span>` : "";
      return `<pre style="position:relative">${langLabel ? `<div style="margin-bottom:4px">${langLabel}</div>` : ""}<code>${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Numbered list
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && !isUser) {
      const processed = simpleMarkdown(message.content);
      contentRef.current.innerHTML = isStreaming ? message.content : `<p>${processed}</p>`;
    }
  }, [message.content, isUser, isStreaming]);

  const time = new Date(message.created_at * 1000).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
          animation: "fadeInUp 0.2s ease",
        }}
      >
        <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              marginBottom: "4px",
              letterSpacing: "0.08em",
            }}
          >
            <span style={{ color: "var(--green-dim)", marginRight: "6px" }}>VOCÊ</span>
            {time}
          </div>
          <div
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border-bright)",
              borderRadius: "4px 4px 0 4px",
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: "13px",
              lineHeight: 1.6,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "16px",
        animation: "fadeInUp 0.2s ease",
      }}
    >
      <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            marginBottom: "4px",
            letterSpacing: "0.08em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: "var(--green-bright)",
              fontWeight: 600,
              letterSpacing: "0.12em",
            }}
          >
            🛡 SECBOT-X
          </span>
          <span>{time}</span>
          {isStreaming && (
            <span
              style={{
                color: "var(--green-dim)",
                fontSize: "9px",
                animation: "blink 1s step-end infinite",
              }}
            >
              PROCESSANDO...
            </span>
          )}
        </div>
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--green-dim)",
            borderRadius: "0 4px 4px 4px",
            padding: "12px 16px",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--text-primary)",
          }}
        >
          {isUser ? (
            message.content
          ) : (
            <div
              ref={contentRef}
              className={`message-content${isStreaming ? " cursor-blink" : ""}`}
              style={{ whiteSpace: isStreaming ? "pre-wrap" : "normal" }}
            >
              {isStreaming ? message.content : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
