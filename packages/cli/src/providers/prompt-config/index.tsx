import { Mode } from "@meow/database";
import {
  DEFAULT_CHAT_MODEL_ID,
  type SupportedChatModelId,
} from "@meow/shared";
import { createContext, useCallback, useContext, useState } from "react";

type PrompConfigContextValue = {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  model: SupportedChatModelId;
  setModel: (model: SupportedChatModelId) => void;
};
const PrompConfigContext = createContext<PrompConfigContextValue | null>(null);

export function usePromptConfig(): PrompConfigContextValue {
  const value = useContext(PrompConfigContext);
  if (!value)
    throw new Error(
      "usePromptConfig must be used within a PromptConfigProvider",
    );
  return value;
}
type PromptConfigProviderProps = {
  children: React.ReactNode;
};
export function PromptConfigProvider({ children }: PromptConfigProviderProps) {
  const [mode, setMode] = useState<Mode>(Mode.BUILD);
  const [model, setModel] = useState<SupportedChatModelId>(
    DEFAULT_CHAT_MODEL_ID,
  );
  const toggleMode = useCallback(() => {
    setMode((m) =>
      m === Mode.BUILD ? Mode.PLAN : m === Mode.PLAN ? Mode.LEARN : Mode.BUILD,
    );
  }, []);
  return (
    <PrompConfigContext.Provider
      value={{ mode, toggleMode, setMode, model, setModel }}
    >
      {children}
    </PrompConfigContext.Provider>
  );
}
