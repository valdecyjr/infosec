"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatAreaProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  conversationId: string | null;
}

export default function ChatArea({
  messages,
  streamingMessage,
  isLoading,
  conversationId,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  if (!conversationId) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          padding: "32px",
        }}
      >
        {/* ASCII art logo */}
        <pre
          style={{
            color: "var(--green-dim)",
            fontSize: "11px",
            lineHeight: 1.3,
            letterSpacing: "0.05em",
            textAlign: "center",
            opacity: 0.7,
          }}
        >{`
 ███████╗███████╗ ██████╗██████╗  ██████╗ ████████╗
 ██╔════╝██╔════╝██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝
 ███████╗█████╗  ██║     ██████╔╝██║   ██║   ██║   
 ╚════██║██╔══╝  ██║     ██╔══██╗██║   ██║   ██║   
 ███████║███████╗╚██████╗██████╔╝╚██████╔╝   ██║   
 ╚══════╝╚══════╝ ╚═════╝╚═════╝  ╚═════╝    ╚═╝   
        `}</pre>

        <div
          className="glow-text"
          style={{
            color: "var(--green-bright)",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          ESPECIALISTA EM SEGURANÇA DA INFORMAÇÃO
        </div>

        <div
          style={{
            color: "var(--text-dim)",
            fontSize: "11px",
            textAlign: "center",
            maxWidth: "480px",
            lineHeight: 1.7,
            letterSpacing: "0.04em",
          }}
        >
          Sistema de IA especializado em Cybersegurança.
          <br />
          Inicie uma nova sessão ou selecione uma anterior.
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            maxWidth: "520px",
            width: "100%",
            marginTop: "8px",
          }}
        >
          {[
            { icon: "🔍", title: "Pentest & Red Team", desc: "Técnicas ofensivas e metodologias" },
            { icon: "🛡️", title: "Blue Team & SOC", desc: "Detecção, resposta e monitoramento" },
            { icon: "🔐", title: "Criptografia & PKI", desc: "Algoritmos e infraestrutura de chaves" },
            { icon: "📋", title: "Compliance & Normas", desc: "LGPD, ISO 27001, NIST, CIS" },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{card.icon}</div>
              <div style={{ color: "var(--green-dim)", fontSize: "11px", fontWeight: 600, marginBottom: "2px" }}>
                {card.title}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>{card.desc}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            marginTop: "8px",
          }}
        >
          ⚠ USO ÉTICO E RESPONSÁVEL · AMBIENTE EDUCACIONAL
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && !isLoading && (
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            textAlign: "center",
            marginTop: "40px",
            letterSpacing: "0.08em",
          }}
        >
          Sessão iniciada. Envie sua primeira mensagem.
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Streaming message */}
      {streamingMessage && (
        <MessageBubble
          key="streaming"
          message={{
            id: "streaming",
            conversation_id: conversationId,
            role: "assistant",
            content: streamingMessage,
            created_at: Math.floor(Date.now() / 1000),
          }}
          isStreaming={true}
        />
      )}

      {/* Loading dots when waiting for first token */}
      {isLoading && !streamingMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            animation: "fadeInUp 0.2s ease",
          }}
        >
          <div
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--green-dim)",
              borderRadius: "0 4px 4px 4px",
              padding: "12px 20px",
              display: "flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--green-dim)",
                  display: "inline-block",
                  animation: `blink 1.2s step-end ${i * 0.2}s infinite`,
                }}
              />
            ))}
            <span
              style={{
                color: "var(--text-dim)",
                fontSize: "11px",
                marginLeft: "4px",
                letterSpacing: "0.08em",
              }}
            >
              Analisando...
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
