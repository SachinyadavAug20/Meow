import { useKeyboard, useRenderer } from "@opentui/react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type Responder = () => void;
type KeyboardLayerContextValue = {
  push: (id: string, responder?: Responder) => void; // add to layer
  pop: (id: string) => void; // close layer
  isTopLayer: (id: string) => boolean; // check
  setResponder: (id: string, responder: Responder | null) => void;
};
const keyboardLayerContext = createContext<KeyboardLayerContextValue | null>(
  null,
);

export function KeyboardLayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<string[]>(["base"]); // home screen
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const responders = useRef<Map<string, Responder>>(new Map()); // avoid duplicate
  const renderer = useRenderer();

  const push = useCallback((id: string, responder?: Responder) => {
    if (responder) {
      responders.current.set(id, responder);
    }

    setStack((prev) => {
      if (prev.includes(id)) return prev; // not add duplicate
      return [...prev, id];
    });
  }, []);

  const pop = useCallback((id: string) => {
    responders.current.delete(id);
    setStack((prev) => {
      return prev.filter((i) => i !== id);
    });
  }, []);

  const isTopLayer = useCallback(
    (id: string) => {
      return stack.length === 0 || stack[stack.length - 1] === id;
    },
    [stack],
  );

  const setResponder = useCallback(
    (id: string, responder: Responder | null) => {
      if (responder) {
        responders.current.set(id, responder);
      } else {
        responders.current.delete(id);
      }
    },
    [],
  );

  // ctl+c handle for windows
  useKeyboard((key) => {
    if (!key.ctrl || key.name !== "c") return;
    const currentStack = stackRef.current;
    for (let i = currentStack.length - 1; i >= 0; i--) {
      const layerId = currentStack[i];
      if (!layerId) return;
      const responder = responders.current.get(layerId);
      if (responder && responder()) return;
    }
    renderer.destroy();
  });
  return (
    <keyboardLayerContext.Provider
      value={{ push, pop, isTopLayer, setResponder }}
    >
      {children}
    </keyboardLayerContext.Provider>
  );
}

export function useKeyboardLayer() {
  const context = useContext(keyboardLayerContext);
  if (!context) {
    throw new Error(
      "useKeyboardLayer must be used within keyboardLayerProvider",
    );
  }
  return context;
}
