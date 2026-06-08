import { Navigate, replace, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { DEFAULT_CHAT_MODEL_ID } from "@nightcode/shared";
import { BotMessage, ErrorMessage, UserMessage } from "../components/message";
import { SessionShell } from "../components/session-shell";
import { useToast } from "src/providers/toast";
import { apiClient } from "lib/api-client";
import { getErrorMessage } from "lib/http-error";

const newSessionStateSchema = z.object({
  message: z.string(),
});

export function NewSession() {
  const navigation = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const hasStartedRef = useRef(false);

  const state = useMemo(() => {
    const parsed = newSessionStateSchema.safeParse(location.state);
    return parsed.success ? parsed.data : null;
  }, [location.state]);

  useEffect(() => {
    if (!state) {
      navigation("/", { replace: true });
    }
  }, [state, navigation]);
  if (!state?.message) return null;

  // create session
  useEffect(() => {
    if (!state || hasStartedRef.current) return;
    hasStartedRef.current = true;
    let ignore = false;
    const createSession = async () => {
      try {
        const res = await apiClient.sessions.$post({
          json: {
            title: state.message.slice(0, 100),
            cwd: process.cwd(),
            initialMessage: {
              role: "USER",
              content: state.message,
              mode: "BUILD",
              model: DEFAULT_CHAT_MODEL_ID,
            },
          },
        });
        if (ignore) return;
        if (!res.ok) throw new Error(await getErrorMessage(res));
        const session = await res.json();
        navigation(`/session/${session.id}`,{
          replace: true,
          state: { session },
        });
      } catch (error) {
        if(ignore) return;

        toast.show({
          variant:"error",
          message: error instanceof Error ? error.message : "Failed to create session",
        });
        navigation("/",{replace:true})
      }
    };
    createSession();
  }, []);
  return (
    <SessionShell onSubmit={() => {}} inputDisabled loading>
      <UserMessage message={state.message} />
      <BotMessage
        content="Hello, I am Meow, your personal AI chatbot. What can I do for you today?"
        model="Meow"
      />
      <ErrorMessage message="I'm sorry, I didn't understand that. Could you please rephrase?" />
    </SessionShell>
  );
}
