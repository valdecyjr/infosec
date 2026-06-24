"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  conversationId: string | null;
}

const QUICK_PROMPTS = [
  "O que é OWASP Top 10?",
  "Como funciona um ataque de SQL Injection?",
  "Explique o conceito de Zero Trust",
  "Quais são as melhores práticas de senhas?",
  "Como implementar MFA seguro?",
  "O que é um pentest e como se realiza?",
];

export default function ChatInput({ onSend, disabled, conversationId }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled, conversationId]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        padding: "12px 20px 16px",
      }}
    >
      {/* Quick prompts */}
      {conversationId && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "10px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                if (!disabled) onSend(prompt);
              }}
              disabled={disabled}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontFamily: "inherit",
                fontSize: "9px",
                letterSpacing: "0.05em",
                padding: "4px 8px",
                borderRadius: "2px",
                cursor: disabled ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.1s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = "var(--green-dark)";
                  e.currentTarget.style.color = "var(--text-dim)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          background: "var(--bg-panel)",
          border: "1px solid",
          borderColor: disabled ? "var(--border)" : "var(--border-bright)",
          borderRadius: "4px",
          padding: "8px 10px 8px 14px",
          transition: "border-color 0.15s ease",
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = "var(--green-dim)";
          e.currentTarget.style.boxShadow = "0 0 8px var(--green-glow)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = "var(--border-bright)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Prompt symbol */}
        <span
          style={{
            color: "var(--green-dim)",
            fontSize: "14px",
            lineHeight: "22px",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          ›
        </span>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || !conversationId}
          placeholder={
            !conversationId
              ? "Inicie uma nova sessão para começar..."
              : disabled
              ? "Aguardando resposta..."
              : "Digite sua pergunta sobre segurança... (Enter para enviar, Shift+Enter para nova linha)"
          }
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            fontSize: "13px",
            lineHeight: "22px",
            resize: "none",
            minHeight: "22px",
            maxHeight: "160px",
            caretColor: "var(--green-bright)",
          }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim() || !conversationId}
          style={{
            background: value.trim() && !disabled && conversationId ? "var(--green-dark)" : "transparent",
            border: "1px solid",
            borderColor: value.trim() && !disabled && conversationId ? "var(--green-dim)" : "var(--border)",
            color: value.trim() && !disabled && conversationId ? "var(--green-bright)" : "var(--text-muted)",
            fontFamily: "inherit",
            fontSize: "11px",
            padding: "5px 12px",
            borderRadius: "3px",
            cursor: value.trim() && !disabled && conversationId ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
            letterSpacing: "0.08em",
            flexShrink: 0,
            alignSelf: "flex-end",
          }}
          onMouseEnter={(e) => {
            if (value.trim() && !disabled && conversationId) {
              e.currentTarget.style.background = "var(--green-dim)";
              e.currentTarget.style.color = "#000";
            }
          }}
          onMouseLeave={(e) => {
            if (value.trim() && !disabled && conversationId) {
              e.currentTarget.style.background = "var(--green-dark)";
              e.currentTarget.style.color = "var(--green-bright)";
            }
          }}
        >
          {disabled ? "..." : "ENVIAR"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
        }}
      >
        <span>SHIFT+ENTER → NOVA LINHA</span>
        <span>⚠ SOMENTE PARA FINS ÉTICOS E EDUCACIONAIS</span>
      </div>
    </div>
  );
}
