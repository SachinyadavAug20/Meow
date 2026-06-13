import { Mode, MessageStatus, db } from "@meow/database";
import { Hono } from "hono";
import { z } from "zod";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";
import { zValidator } from "@hono/zod-validator";
import { streamSSE } from "hono/streaming";
import { streamText as aiStreamText } from "ai";
import type { ChatStreamEvent } from "@meow/shared";

const submitSchema = z.object({
  content: z.string(),
  mode: z.enum(["BUILD", "PLAN","LEARN"]),
  model: z.string().refine(isSupportedChatModel, "Unsupported model"),
});
const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});
const activeResumeSessionIds = new Set<String>();
// conversation history is to maintain
function buildConversationHistory(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    status: MessageStatus;
  }[],
) {
  return messages.flatMap((m) => {
    if (m.role === "ERROR") return [];
    if (m.role === "ASSISTANT" && m.content.length === 0) return [];
    return [
      {
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      },
    ];
  });
}
function getResumeableUserMessage(
  message: {
    role: "USER" | "ASSISTANT" | "ERROR";
    model: String;
    mode: Mode;
  }[],
) {
  const lastMessage = message[message.length - 1];
  if (!lastMessage || lastMessage.role !== "USER") {
    return null;
  }
  return lastMessage;
}

type StreamParams = {
  sessionId: string;
  model: string;
  history: { role: "user" | "assistant"; content: string }[];
  message: string;
  mode: Mode;
  abortController: AbortController;
};
async function streamAIResponse(
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) {
  const { sessionId, model, history, mode, abortController } = params;
  const startTime = Date.now();
  const resolvedModel = resolveChatModel(model);
  let fullText = "";
  const persistInterruptedMessage = async () => {
    if (fullText.length === 0) return;
    const elaspsedMs = Date.now() - startTime;
    await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.INTERRUPTED,
        model,
        content: fullText,
        mode,
        duration: Math.round(elaspsedMs / 1000),
      },
    });
  };
  try {
    const result = aiStreamText({
      model: resolvedModel.model,
      messages: history,
      abortSignal: abortController.signal,
    });
    for await (const part of result.fullStream) {
      if (stream.aborted) break;
      if (part.type === "text-delta") {
        fullText += part.text;
        const event: ChatStreamEvent = { type: "text-delta", text: part.text };
        await stream.writeSSE({
          event: "text-delta",
          data: JSON.stringify(event),
        });
      }
      if (part.type === "error") {
        throw part.error;
      }
    }
    if (stream.aborted || abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }
    const elaspsedMs = Date.now() - startTime;
    const assistantMessage = await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.COMPLETE,
        model,
        content: fullText,
        mode,
        duration: Math.round(elaspsedMs / 1000),
      },
    });
    const doneEvent: ChatStreamEvent = {
      type: "done",
      messageId: assistantMessage.id,
      durationMs: String(elaspsedMs),
    };
    await stream.writeSSE({ event: "done", data: JSON.stringify(doneEvent) });
  } catch (err) {
    if (abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    await db.message.create({
      data: {
        sessionId,
        role: "ERROR",
        status: MessageStatus.COMPLETE,
        model,
        content: message,
        mode,
      },
    });
    const errorEvent: ChatStreamEvent = { type: "error", message };
    await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) });
  }
}

const app = new Hono()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { message: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    const lastMessage = getResumeableUserMessage(session.message);
    if (!lastMessage) {
      return c.json(
        { error: "Session has no pending user message to resume" },
        409,
      );
    }
    if (!isSupportedChatModel(String(lastMessage.model))) {
      return c.json(
        { error: `Session uses unsupported model ${lastMessage.model}` },
        409,
      );
    }
    if (activeResumeSessionIds.has(sessionId)) {
      return c.json({ error: "Session is already resuming" }, 409);
    }
    activeResumeSessionIds.add(sessionId);
    const history = buildConversationHistory(session.message);
    const abortController = new AbortController();
    try {
      return streamSSE(
        c,
        async (stream) => {
          stream.onAbort(() => {
            abortController.abort();
          });
          try {
            await streamAIResponse(stream, {
              sessionId,
              model: String(lastMessage.model),
              history,
              mode: lastMessage.mode,
              abortController,
              message: "",
            });
          } finally {
            activeResumeSessionIds.delete(sessionId);
          }
        },

        async (err, stream) => {
          activeResumeSessionIds.delete(sessionId);
          const message = err instanceof Error ? err.message : String(err);
          const errorEvent: ChatStreamEvent = { type: "error", message };
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify(errorEvent),
          });
        },
      );
    } catch (e) {
      activeResumeSessionIds.delete(sessionId);
      throw e;
    }
  })
  .post("/:sessionId", submitValidator, async (c) => {
    let sessionId, session;
    try {
      sessionId = c.req.param("sessionId");
      if (!sessionId) return c.json({ error: "invalid session id" }, 400);
      session = await db.session.findUnique({
        where: { id: sessionId },
        include: { message: { orderBy: { createdAt: "asc" } } },
      });
      if (!session) {
        return c.json({ error: "Session not found" }, 404);
      }
    } catch (err) {
      console.error("Database error:", err);
      return c.json({ error: "Internal server error" }, 500);
    }
    const data = c.req.valid("json");
    await db.message.create({
      data: {
        sessionId,
        role: "USER",
        status: MessageStatus.COMPLETE,
        model: data.model,
        content: data.content,
        mode: data.mode,
      },
    });
    const history = buildConversationHistory([
      ...session.message, //TODO: only last 10
      {
        role: "USER" as const,
        content: data.content,
        status: MessageStatus.COMPLETE,
      },
    ]);
    const abortController = new AbortController();
    return streamSSE(
      c,
      async (stream) => {
        stream.onAbort(() => {
          abortController.abort();
        });
        await streamAIResponse(stream, {
          sessionId,
          model: data.model,
          message: data.content,
          history,
          mode: data.mode,
          abortController,
        });
      },
      async (err: Error, stream: any) => {
        const message = err instanceof Error ? err.message : String(err);
        const errorEvent: ChatStreamEvent = { type: "error", message };
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify(errorEvent),
        });
      },
    );
  });

export default app;
