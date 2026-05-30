import { TextareaRenderable, type KeyBinding } from "@opentui/core";
import { getRandomQuestion } from "../../utlis/constant";
import StatusBar from "./StatusBar";
import { CommandsMenu } from "./ commandsMenu";
import { useCallback, useEffect, useRef } from "react";
import { useRenderer } from "@opentui/react";
import { useCommandMenu } from "./ commandsMenu/use-command-menu";
import type { Command } from "./ commandsMenu/command.types";

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
  const textareaRef = useRef<TextareaRenderable>(null);
  const onSubmitRef = useRef<() => void>(() => {});
  const renderer = useRenderer();
  const {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
    scrollRef
  } = useCommandMenu();
  const handleCommandExcute=useCallback((index:number)=>{
    const command=resolveCommand(index)
    handleCommand(command)
  },[])
  const handleTextareaContentChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    handleContentChange(textarea.plainText);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.onSubmit = () => {
      onSubmitRef.current();
    };
  }, []);
  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const text = textarea.plainText.trim();
    if (text.length === 0) return;
    onSubmit(text);
    textarea.setText("");
  }, []);
  const handleCommand = useCallback(
    (command: Command | undefined) => {
      const textarea = textareaRef.current;
      if (!textarea || !command) return;
      textarea.setText("");
      if (command.action) {
        command.action({
          exit: () => renderer.destroy(),
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },
    [renderer],
  );
  onSubmitRef.current = () => {
    if (disabled) return;
    if (showCommandMenu) {
      const command = resolveCommand(selectedIndex);
      handleCommand(command);
      return;
    }
    handleSubmit();
  };

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
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor="#1a1a24"
              zIndex={10}
            >
              <CommandsMenu
                query={commandQuery}
                selectedIndex={selectedIndex}
                scrollRef={scrollRef}
                onSelect={setSelectedIndex}
                onExecute={handleCommandExcute}
              />
            </box>
          )}
          <textarea
            onContentChange={handleTextareaContentChange}
            ref={textareaRef}
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
