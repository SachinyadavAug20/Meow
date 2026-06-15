import type { InferResponseType } from "hono";
import { SessionShell } from "../components/session-shell";
import { z } from "zod";
import { apiClient } from "lib/api-client";
import { BotMessage, ErrorMessage, UserMessage } from "src/components/message";
import { useLocation, useNavigate, useParams } from "react-router";
import { useToast } from "src/providers/toast";
import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "lib/http-error";
import prettyMilliseconds from "pretty-ms";
import { messagePartSchema, type SupportedChatModelId } from "@meow/shared";
import { useChat } from "src/hooks/use-chat";
import type { Message, ClientMessagePart } from "../hooks/use-chat";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { MessageStatus } from "@meow/database";
import { useKeyboard } from "@opentui/react";
import { usePromptConfig } from "src/providers/prompt-config";

type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;
const sessionLocationSchema = z.object({
  session: z.custom<SessionData>(
    (val) => val != null && typeof val === "object" && "id" in val,
  ),
});
function mapDbMessages(dbMessages: SessionData["message"]): Message[] {
  return dbMessages.map((m): Message => {
    if (m.role === "ERROR")
      return { id: m.id, role: "error", content: m.content };
    if (m.role === "USER")
      return {
        id: m.id,
        role: "user",
        content: m.content,
        mode: m.mode,
        model: m.model as SupportedChatModelId,
      };
    const parasedParts = m.parts === null ? null : messagePartSchema.safeParse(m.parts)
    const parts: ClientMessagePart[] = parasedParts?.success
      ? parasedParts.data.map((p) =>
          p.type === "tool-call" ? { ...p, status: "done" as const } : p,
        )
      : [];
    return {
      id: m.id,
      role: "assistant",
      content: m.content,
      mode: m.mode,
      model: m.model as SupportedChatModelId,
      part:parts,
      ...(m.duration != null
        ? { duration: prettyMilliseconds(m.duration * 1000) }
        : {}),
      interrupted: m.status === MessageStatus.INTERRUPTED,
    };
  });
}
function ChatMessage({ msg }: { msg: Message }) {
  // which message to display user,bot or error message
  if (msg.role === "user") {
    return <UserMessage message={msg.content} mode={msg.mode} />;
  }
  if (msg.role === "error") {
    return <ErrorMessage message={msg.content} />;
  }
  return (
    <BotMessage
      parts={msg.part}
      model={msg.model}
      mode={msg.mode}
      duration={String(msg.duration)}
      interrupted={msg.interrupted}
    />
  );
}
function SessionChat({ session }: { session: SessionData }) {
  const { mode, model } = usePromptConfig();
  const [initialMessages] = useState(() => mapDbMessages(session.message));
  const { isTopLayer } = useKeyboardLayer();
  const { message, streaming, submit, abort, interrupt } = useChat(
    session.id,
    initialMessages,
  );
  // stop any pending reply when user leaves this session
  useEffect(() => {
    return () => abort();
  }, [abort]);
  useKeyboard((key) => {
    if (
      key.name === "escape" &&
      isTopLayer("base") &&
      streaming.status === "streaming"
    ) {
      key.preventDefault();
      interrupt();
    }
  });
  return (
    <SessionShell
      onSubmit={(text: string) => submit({ userText: text, mode, model })}
      loading={streaming.status === "streaming"}
      interruptible={streaming.status === "streaming"}
      inputDisabled={streaming.status === "streaming"}
    >
      {message.map((msg) => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
      {streaming.status === "streaming" && streaming.part.length > 0 && (
        // to show stream when streaming when streaming done message will go to data base and show in above message
        <BotMessage
          parts={streaming.part}
          model={streaming.model}
          mode={streaming.mode}
          streaming
        />
      )}
    </SessionShell>
  );
}

export function Session() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // two way to reach this page // 1.from session list
  // 2.from new session redirect
  // if comes from new session redirect -> it will have session then why to wait for it to save to DB and then here wait to get it from DB
  // thus use a prefetch to check if have session in it(i.e session is newly created and)
  const prefetched = useMemo(() => {
    // is session in the data
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, [location.state]);
  const [session, setSession] = useState<SessionData | null>(prefetched);
  useEffect(() => {
    if (prefetched) return;
    setSession(null);
    if (!id) return;
    let ignore = false;
    const fetchSession = async () => {
      try {
        const res = await apiClient.sessions[":id"].$get({ param: { id } });
        if (ignore) return;
        if (!res.ok) throw new Error(await getErrorMessage(res));
        setSession(await res.json());
      } catch (error) {
        if (ignore) return;
        toast.show({
          variant: "error",
          message:
            error instanceof Error ? error.message : "Failed to get session",
        });
        navigate("/", { replace: true });
      }
    };
    fetchSession();
    return () => {
      ignore = true;
    };
  }, [id, prefetched, toast, navigate]);
  if (!session) {
    return (
      <SessionShell onSubmit={() => {}} inputDisabled loading>
        <text>No session</text>
      </SessionShell>
    );
  }
  return <SessionChat key={session.id} session={session} />;
}
