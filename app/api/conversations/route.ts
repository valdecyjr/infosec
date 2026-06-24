import { NextRequest, NextResponse } from "next/server";
import client, { initDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    await initDB();

    const result = await client.execute(`
      SELECT 
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        (
          SELECT m.content 
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.role = 'assistant'
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message
      FROM conversations c
      ORDER BY c.updated_at DESC
      LIMIT 50
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB();

    const { title } = await req.json();
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    await client.execute({
      sql: `INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      args: [id, title || "Nova Conversa", now, now],
    });

    return NextResponse.json({ id, title: title || "Nova Conversa", created_at: now, updated_at: now });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await client.execute({ sql: `DELETE FROM conversations WHERE id = ?`, args: [id] });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations error:", error);
    return NextResponse.json({ error: "Erro ao deletar conversa" }, { status: 500 });
  }
}
