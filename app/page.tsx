"use client";

import { useState, useEffect, useCallback } from "react";
import { Conversation, Message } from "@/lib/types";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";

export default function Home() {
  const [sessionReady, setSessionReady] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  // Inicializar sessão anônima via cookie httpOnly
  useEffect(() => {
    const initSession = async () => {
      try {
        await fetch("/api/session"); // Cria o cookie se não existir
        setSessionReady(true);
      } catch (err) {
        console.error("Erro ao iniciar sessão:", err);
        setSessionReady(true); // Tenta continuar mesmo assim
      }
    };
    initSession();
  }, []);

  const loadConversations = useCallback(async () => {
    setSidebarLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Erro ao carregar conversas:", err);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionReady) {
      loadConversations();
    }
  }, [sessionReady, loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  }, []);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      setActiveId(id);
      setMessages([]);
      setStreamingMessage("");
      await loadMessages(id);
    },
    [loadMessages],
  );

  const handleNewConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Sessão" }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
        setMessages([]);
        setStreamingMessage("");
      }
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations?id=${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Erro ao deletar conversa:", err);
    }
  };

  const handleSend = async (message: string) => {
    if (!activeId || isLoading) return;

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeId,
      role: "user",
      content: message,
      created_at: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, message }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro na API");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                accumulated += parsed.delta;
                setStreamingMessage(accumulated);
              }
              if (parsed.done) {
                const assistantMsg: Message = {
                  id: parsed.messageId,
                  conversation_id: activeId,
                  role: "assistant",
                  content: accumulated,
                  created_at: Math.floor(Date.now() / 1000),
                };
                setMessages((prev) => {
                  const withoutTemp = prev.filter(
                    (m) => !m.id.startsWith("temp-"),
                  );
                  return [...withoutTemp, tempUserMsg, assistantMsg];
                });
                setStreamingMessage("");
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeId
                      ? {
                          ...c,
                          updated_at: Math.floor(Date.now() / 1000),
                          last_message: accumulated.slice(0, 80),
                        }
                      : c,
                  ),
                );
              }
            } catch {
              // ignorar parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: activeId,
        role: "assistant",
        content: `⚠ **Erro de conexão**\n\nNão foi possível obter resposta. Verifique:\n- Chave da API OpenRouter configurada\n- Conexão com o Turso\n\n\`${err instanceof Error ? err.message : String(err)}\``,
        created_at: Math.floor(Date.now() / 1000),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStreamingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de inicialização
  if (!sessionReady) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            color: "var(--green-bright)",
            fontSize: "13px",
            letterSpacing: "0.2em",
          }}
          className="cursor-blink"
        >
          INICIALIZANDO SECBOT-X
        </div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "10px",
            letterSpacing: "0.1em",
          }}
        >
          Estabelecendo sessão segura...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        loading={sidebarLoading}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {activeId ? (
              <>
                <span
                  style={{
                    color: "var(--green-dim)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                  }}
                >
                  SESSION://
                </span>
                <span
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                >
                  {activeId.slice(0, 8)}...
                </span>
              </>
            ) : (
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                }}
              >
                AGUARDANDO SESSÃO
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
              }}
            >
              MODEL:{" "}
              <span style={{ color: "var(--green-dim)" }}>
                LLAMA-4-MAVERICK
              </span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
              }}
            >
              DB:{" "}
              <span style={{ color: "var(--green-dim)" }}>TURSO/SQLite</span>
            </div>
            {/* Indicador de sessão anônima */}
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--green-dim)",
                  display: "inline-block",
                }}
              />
              SESSÃO LOCAL
            </div>
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "var(--green-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--green-bright)",
                    display: "inline-block",
                    animation: "blink 0.6s step-end infinite",
                  }}
                />
                PROCESSANDO
              </div>
            )}
          </div>
        </header>

        <ChatArea
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
          conversationId={activeId}
        />

        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          conversationId={activeId}
        />
      </div>
    </div>
  );
}
