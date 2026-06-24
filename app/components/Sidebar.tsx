"use client";

import { useState } from "react";
import { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
}: SidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString("pt-BR", { weekday: "short" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 14px 12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              color: "var(--green-bright)",
              lineHeight: 1,
            }}
          >
            🛡️
          </span>
          <div>
            <div
              className="glow-text"
              style={{
                color: "var(--green-bright)",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.12em",
              }}
            >
              SECBOT-X
            </div>
            <div
              style={{
                color: "var(--text-dim)",
                fontSize: "9px",
                letterSpacing: "0.15em",
              }}
            >
              INFOSEC AI ASSISTANT
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--green-bright)",
              boxShadow: "0 0 6px var(--green-bright)",
              animation: "pulse-green 2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          <span style={{ color: "var(--text-dim)", fontSize: "10px", letterSpacing: "0.1em" }}>
            SISTEMA ONLINE
          </span>
        </div>

        <button
          onClick={onNew}
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid var(--green-dark)",
            color: "var(--green-dim)",
            fontFamily: "inherit",
            fontSize: "11px",
            letterSpacing: "0.1em",
            cursor: "pointer",
            borderRadius: "3px",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--green-bright)";
            e.currentTarget.style.color = "var(--green-bright)";
            e.currentTarget.style.background = "var(--green-glow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--green-dark)";
            e.currentTarget.style.color = "var(--green-dim)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span style={{ fontSize: "14px" }}>+</span>
          NOVA SESSÃO
        </button>
      </div>

      {/* Conversations list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 8px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "var(--text-muted)",
            padding: "6px 6px 4px",
            marginBottom: "4px",
          }}
        >
          SESSÕES ANTERIORES
        </div>

        {loading && conversations.length === 0 && (
          <div style={{ color: "var(--text-dim)", fontSize: "11px", padding: "12px 6px" }}>
            Carregando...
          </div>
        )}

        {conversations.length === 0 && !loading && (
          <div style={{ color: "var(--text-muted)", fontSize: "11px", padding: "12px 6px", lineHeight: 1.5 }}>
            Nenhuma sessão ainda.{"\n"}Inicie uma nova conversa.
          </div>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              padding: "8px 8px",
              marginBottom: "2px",
              borderRadius: "3px",
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeId === conv.id ? "var(--green-dark)" : "transparent",
              background: activeId === conv.id ? "var(--bg-hover)" : "transparent",
              transition: "all 0.1s ease",
              position: "relative",
              animation: "fadeInUp 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (conv.id !== activeId) {
                e.currentTarget.style.background = "#0a180a";
                e.currentTarget.style.borderColor = "#0a2a0a";
              }
              const btn = e.currentTarget.querySelector(".del-btn") as HTMLElement;
              if (btn) btn.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              if (conv.id !== activeId) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }
              const btn = e.currentTarget.querySelector(".del-btn") as HTMLElement;
              if (btn) btn.style.opacity = "0";
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: activeId === conv.id ? "var(--green-bright)" : "var(--text-primary)",
                marginBottom: "3px",
                paddingRight: "20px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {conv.title}
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {formatDate(conv.updated_at)}
            </div>

            <button
              className="del-btn"
              onClick={(e) => handleDelete(e, conv.id)}
              disabled={deletingId === conv.id}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "none",
                border: "none",
                color: "var(--red-alert)",
                cursor: "pointer",
                fontSize: "12px",
                opacity: 0,
                transition: "opacity 0.1s",
                padding: "2px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--border)",
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
        }}
      >
        <div>POWERED BY OPENROUTER + TURSO</div>
        <div style={{ marginTop: "2px", color: "#1a3a1a" }}>v1.0.0 · CLASSIFICADO</div>
      </div>
    </aside>
  );
}
