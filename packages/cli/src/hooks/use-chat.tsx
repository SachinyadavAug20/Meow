import type { Mode } from "@meow/database";
import {
  chatStreamEventSchema,
  type SupportedChatModelId,
} from "@nightcode/shared";
import { EventSourceParserStream } from "eventsource-parser/stream";
import type { ClientResponse } from "hono/client";
import { requestId } from "hono/request-id";
import { apiClient } from "lib/api-client";
import { getErrorMessage } from "lib/http-error";
import prettyMs from "pretty-ms";
import { useCallback, useRef, useState } from "react";
import { string } from "zod";

export type ClientMessagePart = { type: "text"; text: string };
export type Message =
  | {
      id: string;
      role: "user";
      content: string;
      mode: Mode;
      model: SupportedChatModelId;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      mode: Mode;
      model: SupportedChatModelId;
      part: ClientMessagePart[];
      duration?: string;
    }
  | {
      id: string;
      role: "error";
      content: string;
    };
type streamingState =
  | { status: "idle" }
  | {
      status: "streaming";
      part: ClientMessagePart[];
      mode: Mode;
      model: SupportedChatModelId;
    };
type ActiveStream = {
  requestId: string;
  controller: AbortController;
  mode: Mode;
  model: SupportedChatModelId;
  parts: ClientMessagePart[];
};
type SubmitParams = {
  userText: string;
  mode: Mode;
  model: SupportedChatModelId;
};
type RunStreamParams = {
  mode: Mode;
  model: SupportedChatModelId;
  request: (controller: AbortController) => Promise<ClientResponse<unknown>>;
};
export function useChat(sessionId: string, initialMessages: Message[]) {
  const [message, setMessage] = useState<Message[]>(initialMessages);
  const [streaming, setStreaming] = useState<streamingState>({
    status: "idle",
  });
  const ActiveStreamRef = useRef<ActiveStream | null>(null);
  const updateMessage = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      setMessage((prev) => updater(prev));
    },
    [],
  );
  const isActiveRequest = useCallback((requestId: string) => {
    return ActiveStreamRef.current?.requestId === requestId;
  }, []);
  const emitPart = useCallback(
    (requestId: string, parts: ClientMessagePart[]) => {
      if (!isActiveRequest(requestId)) return;
      const snapshot = [...parts];
      const activeStream = ActiveStreamRef.current;
      if (!activeStream) return;
      activeStream.parts = snapshot;
      setStreaming({
        status: "streaming",
        part: snapshot,
        mode: activeStream.mode,
        model: activeStream.model,
      });
    },
    [isActiveRequest],
  );
  const clearStream = useCallback(
    (requestId: string) => {
      if (!isActiveRequest(requestId)) return;
      ActiveStreamRef.current = null;
      setStreaming({ status: "idle" });
    },
    [isActiveRequest],
  );
  const handleStream = useCallback(
    async (response: ClientResponse<unknown>, activeStream: ActiveStream) => {
      if (!isActiveRequest(activeStream.requestId)) return;
      if (!response.ok) {
        const message = await getErrorMessage(response);
        updateMessage((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content: message,
          },
        ]);
        return;
      }

      const parts: ClientMessagePart[] = [];
      const stream = response.body
        ?.pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream());
      for await (const { data } of stream!) {
        if (!isActiveRequest(activeStream.requestId)) return;
        let event;
        try {
          event = chatStreamEventSchema.parse(JSON.parse(data));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "invalid event";
          updateMessage((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "error",
              content: message,
            },
          ]);
          break;
        }
        switch (event.type) {
          case "text-delta": {
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.type === "text") {
              lastPart.text += event.text;
            } else {
              parts.push({ type: "text", text: event.text });
            }
            emitPart(activeStream.requestId, parts);
            break;
          }
          case "done": {
            if (!isActiveRequest(activeStream.requestId)) return;
            const fullText = parts
              .filter((p) => p.text === "text")
              .map((p) => p.text)
              .join("");
            updateMessage((prev) => [
              ...prev,
              {
                id: event.messageId,
                role: "assistant",
                content: fullText,
                mode: activeStream.mode,
                model: activeStream.model,
                duration: prettyMs(Number(event.durationMs)),
                part: [...parts],
              },
            ]);
            break;
          }
          case "error":
            updateMessage((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "error",
                content: event.message,
              },
            ]);
            break;
        }
      }
    },
    [updateMessage, emitPart, isActiveRequest],
  );
  const runStream = useCallback(
    async ({ mode, model, request }: RunStreamParams) => {
      const controller = new AbortController();
      const activeStream: ActiveStream = {
        requestId: crypto.randomUUID(),
        controller,
        mode,
        model,
        parts: [],
      };
      ActiveStreamRef.current = activeStream;
      setStreaming({ status: "streaming", part: [], mode, model });
      try {
        const response = await request(controller);
        await handleStream(response, activeStream);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (!isActiveRequest(activeStream.requestId)) return;
        const message = err instanceof Error ? err.message : String(err);
        updateMessage((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content: message,
          },
        ]);
      } finally {
        clearStream(activeStream.requestId);
      }
    },
    [clearStream, handleStream, isActiveRequest, updateMessage],
  );
  const resume = useCallback(
    async ({ mode, model }: Omit<SubmitParams, "userText">) => {
      await runStream({
        mode,
        model,
        request: async (controller) => {
          return apiClient.chat[":sessionId"].resume.$post(
            { param: { sessionId } },
            { init: { signal: controller.signal } },
          );
        },
      });
    }, [runStream,sessionId]);
}
