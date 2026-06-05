import { TextareaRenderable, type KeyBinding } from "@opentui/core";
import { getRandomQuestion } from "../../utlis/constant";
import StatusBar from "./StatusBar";
import { CommandsMenu } from "./ commandsMenu";
import { useCallback, useEffect, useRef } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useCommandMenu } from "./ commandsMenu/use-command-menu";
import type { Command } from "./ commandsMenu/command.types";
import { useToast } from "../providers/toast";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { useDialog } from "../providers/dialog";
import { useTheme } from "../providers/theme";

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
  const toast = useToast();
  const dialog = useDialog();
  const { isTopLayer, setResponder } = useKeyboardLayer();

  const {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
    scrollRef,
  } = useCommandMenu();
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
          toast,
          dialog,
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },
    [renderer, toast],
  );

  const handleCommandExcute = useCallback(
    (index: number) => {
      const command = resolveCommand(index);
      handleCommand(command);
    },
    [resolveCommand, handleCommand],
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

  useEffect(() => {
    setResponder("base",()=>{
      if(disabled) return false;
      const textarea = textareaRef.current;
      if(textarea && textarea.plainText.length>0){
        textarea.setText("");
        return true
      }
      return false
    });
    return ()=> setResponder("base",null);
  }, [disabled,setResponder]);
  const {colors}=useTheme();

  return (
    <box width="100%" alignItems="center">
      <box border={["left"]} borderColor={colors.primary} width="100%">
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor={colors.surface}
          width="100%"
          gap={1}
        >
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor={colors.surface}
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
            focused={!disabled && (isTopLayer("base") || isTopLayer("command"))}
            placeholder={`Ask anything... ${getRandomQuestion()}`}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
