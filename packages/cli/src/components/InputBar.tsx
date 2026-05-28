import type { KeyBinding } from "@opentui/core";
import { getRandomQuestion } from "../../utlis/constant";
import StatusBar from "./StatusBar";

interface Prop {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "enter", action: "submit" },
  { name: "return", shift: true, action: "newline" },
  { name: "enter", shift: true, action: "newline" },
];
export function InputBar({ onSubmit, disabled }: Prop) {
  return (
    <box width="100%" alignItems="center">
      <box border={["left"]} borderColor="cyan" width="100%">
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor="#1a1a24"
          width="100%"
          gap={1}
        >
          <textarea
            flexGrow={1}
            keyBindings={TEXTAREA_KEY_BINDINGS}
            focused={!disabled}
            placeholder={`Ask anything... ${getRandomQuestion()}`}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
