import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { BotMessage, ErrorMessage, UserMessage } from "../components/message";
import { SessionShell } from "../components/session-shell";

export function NewSession() {
  const navigation = useNavigate();
  const location = useLocation();

  const state = location.state as { message?: string } | null; // way to access params
  useEffect(() => {
    if (!state?.message) {
      navigation("/", { replace: true });
    }
  }, [state, navigation]);
  if (!state?.message) return null;

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
