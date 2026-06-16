import {
  ScrollBarRenderable,
  ScrollBox,
  ScrollBoxRenderable,
  TextareaRenderable,
  TextAttributes,
  type KeyBinding,
} from "@opentui/core";
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
import { useNavigate } from "react-router";
import { usePromptConfig } from "src/providers/prompt-config";
import { Mode } from "@meow/database";
import { isAbsolute, relative, resolve } from "node:path";
import { readdir } from "node:fs/promises";
import type { RefObject } from "hono/jsx";

const MAX_VISIBLE_MENTIONS = 8;
const CURRENT_DIRECTORY = process.cwd();
const MAX_FALLBACK_MENTION_CANDIDATES = 32;
const MENTION_QUERY_CHARACTER = /[A-Za-z0-9._/-]/;
const RECURSIVE_MENTION_IGNORED_DIRECTORIES = new Set(["node_modules", ".git"]);

type MentionMatch = {
  start: number;
  end: number;
  query: string;
};
type MentionCandidate = {
  path: string;
  kind: "file" | "directory";
};

function isWithinCurrentDirectory(targetPath: string) {
  const relativePath = relative(CURRENT_DIRECTORY, targetPath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  );
}

function isMentionQueryCharacter(char: string) {
  return MENTION_QUERY_CHARACTER.test(char);
}
function findActiveMentions(
  text: string,
  cursorOffSet: number,
): MentionMatch | null {
  const safeOffSet = Math.max(0, Math.min(cursorOffSet, text.length));
  let start = safeOffSet;
  while (start > 0 && !/\s/.test(text[start - 1]!)) {
    start--;
  }
  let end = safeOffSet;
  while (end < text.length && !/\s/.test(text[end]!)) {
    end++;
  }
  const token = text.slice(start, end);
  const relativeCursor = safeOffSet - start;
  const MentionStart = token.lastIndexOf("@", relativeCursor);
  if (MentionStart === -1) return null;
  const previousChar = token[MentionStart - 1];
  if (previousChar && isMentionQueryCharacter(previousChar)) {
    return null;
  }
  let mentionEnd = MentionStart + 1;
  while (
    mentionEnd < token.length &&
    isMentionQueryCharacter(token[mentionEnd]!)
  ) {
    mentionEnd++;
  }
  if (relativeCursor < MentionStart || relativeCursor > mentionEnd) {
    return null;
  }
  return {
    start: start + MentionStart,
    end: start + mentionEnd,
    query: token.slice(MentionStart + 1, mentionEnd),
  };
}

async function getMentionCandidates(
  query: string,
): Promise<MentionCandidate[]> {
  const normalizedQuery = query.startsWith("./") ? query.slice(2) : query;
  if (normalizedQuery.startsWith("/")) {
    return [];
  }
  const hasTrailingSlash = normalizedQuery.endsWith("/");
  const lastSlashIndex = hasTrailingSlash
    ? normalizedQuery.length - 1
    : normalizedQuery.lastIndexOf("/");
  const directoryPart = hasTrailingSlash
    ? normalizedQuery.slice(0, -1)
    : lastSlashIndex === -1
      ? ""
      : normalizedQuery.slice(0, lastSlashIndex);
  const namePrefix = hasTrailingSlash
    ? ""
    : lastSlashIndex === -1
      ? normalizedQuery
      : normalizedQuery.slice(lastSlashIndex + 1);
  const absoluteDir = resolve(CURRENT_DIRECTORY, directoryPart || ".");
  if (!isWithinCurrentDirectory(absoluteDir)) {
    return [];
  }
  try {
    const entries = await readdir(absoluteDir, { withFileTypes: true });
    const lowercasePrefix = namePrefix.toLowerCase();
    const showHiddenentries = namePrefix.startsWith(".");

    const directMatches = entries
      .filter((entry) => showHiddenentries || !entry.name.startsWith("."))
      .filter((entry) => {
        return (
          lowercasePrefix === "" ||
          entry.name.toLowerCase().startsWith(lowercasePrefix)
        );
      })
      .sort((left, right) => {
        if (left.isDirectory() !== right.isDirectory()) {
          return left.isDirectory() ? -1 : 1;
        }
        return left.name.localeCompare(right.name);
      })
      .map((entry) => {
        const path = directoryPart
          ? `${directoryPart}/${entry.name}`
          : entry.name;
        const kind: MentionCandidate["kind"] = entry.isDirectory()
          ? "directory"
          : "file";
        return {
          path: kind === "directory" ? `${path}/` : path,
          kind,
        };
      });
    if (directMatches.length > 0 || directoryPart !== "" || namePrefix === "") {
      return directMatches;
    }
    const fallbackMatches: MentionCandidate[] = [];
    const visit = async (
      absoluteDir: string,
      directoryPart: string,
    ): Promise<void> => {
      const entries = await readdir(absoluteDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!showHiddenentries && entry.name.startsWith(".")) {
          continue;
        }
        if (
          entry.isDirectory() &&
          RECURSIVE_MENTION_IGNORED_DIRECTORIES.has(entry.name)
        ) {
          continue;
        }
        const path = directoryPart
          ? `${directoryPart}/${entry.name}`
          : entry.name;
        const kind: MentionCandidate["kind"] = entry.isDirectory()
          ? "directory"
          : "file";
        if (entry.name.toLowerCase().startsWith(lowercasePrefix)) {
          fallbackMatches.push({
            path: kind === "directory" ? `${path}/` : path,
            kind,
          });
          if (fallbackMatches.length === MAX_FALLBACK_MENTION_CANDIDATES)
            return;
        }
        if (entry.isDirectory()) {
          await visit(resolve(absoluteDir, entry.name), path);
          if (fallbackMatches.length >= MAX_FALLBACK_MENTION_CANDIDATES) {
            return;
          }
        }
      }
    };
    await visit(CURRENT_DIRECTORY, "");
    return fallbackMatches.sort((left, right) =>
      left.path.localeCompare(right.path),
    );
  } catch (error) {
    return [];
  }
}

type FileMentionMenuProps = {
  candidates: MentionCandidate[];
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable> | undefined;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};
function FileMentionMenu({
  candidates,
  selectedIndex,
  scrollRef,
  onSelect,
  onExecute,
}: FileMentionMenuProps) {
  const { colors } = useTheme();
  const visibleHeight = Math.min(candidates.length, MAX_VISIBLE_MENTIONS);
  if (candidates.length === 0) {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          No matching files or folders
        </text>
      </box>
    );
  }
  return (
    <scrollbox ref={scrollRef} height={visibleHeight}>
      {candidates.map((candidate, i) => {
        const isSelected = i === selectedIndex;
        return (
          <box
            key={candidate.path}
            flexDirection="row"
            paddingX={1}
            height={1}
            overflow="hidden"
            backgroundColor={isSelected ? colors.selection : undefined}
            onMouseMove={() => onSelect(i)}
            onMouseDown={() => onExecute(i)}
          >
            <box flexGrow={1} flexShrink={1} overflow="hidden">
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                {candidate.path}
              </text>
            </box>
            <box width={8} alignItems="flex-end" flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                {candidate.kind === "directory" ? "📁" : "📄"}
              </text>
            </box>
          </box>
        );
      })}
    </scrollbox>
  );
}

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
  const { mode, toggleMode, setMode, setModel, model } = usePromptConfig();
  const textareaRef = useRef<TextareaRenderable>(null);
  const onSubmitRef = useRef<() => void>(() => {});
  const renderer = useRenderer();
  const toast = useToast();
  const dialog = useDialog();
  const { isTopLayer, setResponder } = useKeyboardLayer();
  const navigate = useNavigate();

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
          navigate,
          mode,
          setMode,
          setModel,
          model,
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },
    [renderer, toast, dialog, navigate, mode, setMode, setModel],
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
  useKeyboard((key) => {
    if (disabled) return;
    if (!isTopLayer("base")) return;
    if (key.name === "tab") {
      key.preventDefault();
      toggleMode();
    }
  });

  useEffect(() => {
    setResponder("base", () => {
      if (disabled) return false;
      const textarea = textareaRef.current;
      if (textarea && textarea.plainText.length > 0) {
        textarea.setText("");
        return true;
      }
      return false;
    });
    return () => setResponder("base", null);
  }, [disabled, setResponder]);
  const { colors } = useTheme();

  return (
    <box width="100%" alignItems="center">
      <box
        border={["left"]}
        borderColor={
          mode === Mode.BUILD
            ? colors.primary
            : mode === Mode.PLAN
              ? colors.planMode
              : colors.learnMode
        }
        width="100%"
      >
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
            placeholder={getRandomQuestion()}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
