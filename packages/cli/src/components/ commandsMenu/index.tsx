import { type ScrollBoxRenderable, TextAttributes } from "@opentui/core";
import { COMMANDS } from "./commands";
import { getFilteredCommands } from "./filter-commands";
import type { RefObject } from "react";

const MAX_VISIBLE_ITEMS = 8;
const COMMAND_COL_WIDTH =
  Math.max(...COMMANDS.map((cmd) => cmd.name.length)) + 4;
// make table like instead of start description when the command name end

type CommandMenuProps = {
  query: string;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};

export function CommandsMenu({
  query,
  selectedIndex,
  scrollRef,
  onSelect,
  onExecute,
}: CommandMenuProps) {
  const filteredCommands = getFilteredCommands(query);
  const visibleHeight = Math.min(filteredCommands.length, MAX_VISIBLE_ITEMS);
  if (filteredCommands.length === 0) {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>No matches commands</text>
      </box>
    );
  }
  return (
    <scrollbox ref={scrollRef} height={visibleHeight}>
      {filteredCommands.map((cmd, i) => {
        const isSelected = i === selectedIndex;
        return (
          <box
            key={cmd.value}
            flexDirection="row"
            paddingX={1}
            height={1}
            overflow="hidden"
            backgroundColor={isSelected ? "#89b4fa" : undefined}
            onMouseOver={() => onSelect(i)}
            onKeyDown={()=>onExecute(i)}
          >
            <box width={COMMAND_COL_WIDTH} flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                /{cmd.name}
              </text>
            </box>
            <box overflow="hidden" flexShrink={1} flexGrow={1}>
              <text selectable={false} fg={isSelected ? "black" : "gray"}>
                /{cmd.description}
              </text>
            </box>
          </box>
        );
      })}
    </scrollbox>
  );
}
