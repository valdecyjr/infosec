import { NextRequest, NextResponse } from "next/server";
import getClient, { initDB } from "@/lib/db";
import { INFOSEC_SYSTEM_PROMPT, OPENROUTER_CONFIG } from "@/lib/prompt";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "secbot_session";

export async function POST(req: NextRequest) {
  const client = getClient();
  try {
    await initDB();

    const sessionId = req.cookies.get(COOKIE_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 401 },
      );
    }

    const { conversationId, message } = await req.json();

    if (!conversationId || !message?.trim()) {
      return NextResponse.json(
        { error: "conversationId e message são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar que a conversa pertence a esta sessão
    const convCheck = await client.execute({
      sql: `SELECT id FROM conversations WHERE id = ? AND session_id = ?`,
      args: [conversationId, sessionId],
    });
    if (convCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 403 },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY não configurada" },
        { status: 500 },
      );
    }

    // Buscar histórico da conversa (últimas 20 mensagens para contexto)
    const historyResult = await client.execute({
      sql: `
        SELECT role, content FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT 20
      `,
      args: [conversationId],
    });

    const history = historyResult.rows.map((row) => ({
      role: row.role as string,
      content: row.content as string,
    }));

    // Salvar mensagem do usuário
    const userMsgId = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    await client.execute({
      sql: `INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)`,
      args: [userMsgId, conversationId, message.trim(), now],
    });

    // Atualizar título da conversa se for a primeira mensagem
    const msgCount = history.length;
    if (msgCount === 0) {
      const title =
        message.trim().slice(0, 60) + (message.trim().length > 60 ? "..." : "");
      await client.execute({
        sql: `UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?`,
        args: [title, now, conversationId],
      });
    } else {
      await client.execute({
        sql: `UPDATE conversations SET updated_at = ? WHERE id = ?`,
        args: [now, conversationId],
      });
    }

    // Montar mensagens para a API
    const messages = [...history, { role: "user", content: message.trim() }];

    // Chamada para OpenRouter com streaming
    const openrouterResponse = await fetch(
      `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://infosec-ai.local",
          "X-Title": "SecBot-X InfoSec Assistant",
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.model,
          messages: [
            { role: "system", content: INFOSEC_SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: OPENROUTER_CONFIG.maxTokens,
          temperature: OPENROUTER_CONFIG.temperature,
          stream: true,
        }),
      },
    );

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error("OpenRouter error:", errorText);
      return NextResponse.json(
        { error: `Erro na API OpenRouter: ${openrouterResponse.status}` },
        { status: openrouterResponse.status },
      );
    }

    // Streaming response
    const assistantMsgId = uuidv4();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openrouterResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();

                if (data === "[DONE]") {
                  // Salvar resposta completa no banco
                  const savedAt = Math.floor(Date.now() / 1000);
                  await client.execute({
                    sql: `INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, 'assistant', ?, ?)`,
                    args: [
                      assistantMsgId,
                      conversationId,
                      fullContent,
                      savedAt,
                    ],
                  });

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ done: true, messageId: assistantMsgId })}\n\n`,
                    ),
                  );
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    fullContent += delta;
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ delta })}\n\n`,
                      ),
                    );
                  }
                } catch {
                  // Ignorar linhas malformadas
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
