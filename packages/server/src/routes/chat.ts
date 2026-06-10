import { Mode, MessageStatus, db } from "@meow/database";
import { Hono } from "hono";
import { record, z } from "zod";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";
import { zValidator } from "@hono/zod-validator";
import {
  MESSAGE_MATCHER_IS_ALREADY_BUILT,
  type ParamIndexMap,
} from "hono/router";
import { streamSSE } from "hono/streaming";
import { streamText as aiStreamText } from "ai";
import type { ChatStreamEvent } from "@meow/shared";
import { defaultPlugin } from "hono/ssg";

const submitSchema = z.object({
  content: z.string(),
  mode: z.enum(Mode),
  model: z.string().refine(isSupportedChatModel, "Unsupported model"),
});
const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});
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
        durationMs: Math.round(elaspsedMs / 1000),
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
const app = new Hono().post("/:sessionId", submitValidator, async (c) => {
  const sessionId = c.req.param("sessionId");
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { message: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
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
  return streamSSE(c, async (stream) => {
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
    async (err:Error,stream:any)=>{
      const message=err instanceof Error?err.message:String(err);
      const errorEvent:ChatStreamEvent={type:"error",message}
      await stream.writeSSE({event:"error",data:JSON.stringify(errorEvent)})
    }
  });
});

export default app;
