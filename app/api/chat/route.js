import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../lib/db";
import { nextTurn, scoreLead } from "../../../lib/chatbot";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { sessionId, stage = "welcome", message = "", lead = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Log inbound user message (skip on the very first welcome ping)
    if (message) {
      await db.execute({
        sql: "INSERT INTO conversations (session_id, role, message) VALUES (?, ?, ?)",
        args: [sessionId, "user", message],
      });
    }

    const turn = nextTurn(stage, message, lead);
    const mergedLead = { ...lead, ...(turn.captured || {}) };

    // Log bot reply
    await db.execute({
      sql: "INSERT INTO conversations (session_id, role, message) VALUES (?, ?, ?)",
      args: [sessionId, "bot", turn.reply],
    });

    // Persist / update the lead once we have an email or phone.
    if (mergedLead.email || mergedLead.phone) {
      const score = scoreLead(mergedLead);
      // upsert by session: store sessionId in name field prefix? Simpler: keep one row per session.
      const existing = await db.execute({
        sql: "SELECT id FROM leads WHERE email = ? OR phone = ? LIMIT 1",
        args: [mergedLead.email || "___", mergedLead.phone || "___"],
      });
      if (existing.rows.length) {
        await db.execute({
          sql: `UPDATE leads SET name=?, email=?, phone=?, company=?, industry=?,
                team_size=?, budget=?, pain_points=?, desired_solution=?, score=?
                WHERE id=?`,
          args: [
            mergedLead.name || null,
            mergedLead.email || null,
            mergedLead.phone || null,
            mergedLead.company || null,
            mergedLead.industry || null,
            mergedLead.team_size || null,
            mergedLead.budget || null,
            mergedLead.pain_points || null,
            mergedLead.desired_solution || null,
            score,
            existing.rows[0].id,
          ],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO leads (name, email, phone, company, industry,
                team_size, budget, pain_points, desired_solution, score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            mergedLead.name || null,
            mergedLead.email || null,
            mergedLead.phone || null,
            mergedLead.company || null,
            mergedLead.industry || null,
            mergedLead.team_size || null,
            mergedLead.budget || null,
            mergedLead.pain_points || null,
            mergedLead.desired_solution || null,
            score,
          ],
        });
      }
    }

    return NextResponse.json({
      reply: turn.reply,
      nextStage: turn.nextStage,
      options: turn.options || null,
      finished: !!turn.finished,
      lead: mergedLead,
    });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
