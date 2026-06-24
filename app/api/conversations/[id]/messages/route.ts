import { NextRequest, NextResponse } from "next/server";
import getClient, { initDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const client = getClient();
  try {
    await initDB();
    const { id } = await params;

    const result = await client.execute({
      sql: `
        SELECT id, conversation_id, role, content, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
      `,
      args: [id],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 },
    );
  }
}
