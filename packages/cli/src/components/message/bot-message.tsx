import type { ClientMessagePart, ClientToolCallPart } from "src/hooks/use-chat";
import { useTheme } from "../../providers/theme";
import { Mode } from "@meow/database";
import { TextAttributes } from "@opentui/core";

type Props = {
  parts: ClientMessagePart[];
  model: string;
  mode: Mode;
  duration?: string;
  streaming?: boolean;
  interrupted?: boolean;
};
function formatToolName(name: string): string {
  // readFile => Read File , grep => Grep
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}
function formatToolArgs(tc: ClientToolCallPart): string {
  return Object.values(tc.args).map(String).join(" ");
}
type PartGroup = {
  type: ClientMessagePart["type"];
  parts: ClientMessagePart[];
  key: string;
};
function groupConsectiveParts(parts: ClientMessagePart[]): PartGroup[] {
  const groups: PartGroup[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.type === part.type) {
      lastGroup.parts.push(part);
    } else {
      const key =
        part.type === "tool-call"
          ? `group-tc-${part.id}`
          : `group-${part.type}-${i}`;
      groups.push({ type: part.type, parts: [part], key });
    }
  }
  return groups;
}

export function BotMessage({
  parts,
  model,
  mode,
  duration,
  streaming = false,
  interrupted = false,
}: Props) {
  const { colors } = useTheme();

  return (
    <box width="100%" alignItems="center">
      {groupConsectiveParts(parts).map((group) => (
        <box key={group.key} paddingY={1} width="100%">
          {group.parts.map((part, j) => {
            if (part.type === "reasoning") {
              return (
                <box
                  key={`reasoning-${j}`}
                  width="100%"
                  border={["left"]}
                  borderColor={colors.thinkingBorder}
                  paddingX={2}
                >
                  <text attributes={TextAttributes.DIM}>
                    <text fg={colors.thinking}>Thinking: </text>
                    {part.text || " "}
                  </text>
                </box>
              );
            }
            if (part.type === "tool-call") {
              return (
                <box
                  key={part.id}
                  width="100%"
                  border={["left"]}
                  borderColor={colors.thinkingBorder}
                  paddingX={2}
                >
                  <text attributes={TextAttributes.DIM}>
                    <text fg={colors.thinking}>{formatToolName(part.name)}:</text>{" "}
                    {formatToolArgs(part) || " "}
                    {part.status === "calling" ? "..." : null}
                  </text>
                </box>
              );
            }
            if(part.type==="text"){
              return(
                <box key={`text-${j}`} width="100%" paddingX={3}>
                  <text>{part.text || " "}</text>
                </box>
              )
            }
            return null;
          })}
        </box>
      ))}
      <box paddingX={3} paddingBottom={1} gap={1} width="100%">
        <box flexDirection="row" gap={2}>
          <text
            fg={
              interrupted
                ? undefined
                : mode === Mode.PLAN
                  ? colors.planMode
                  : mode === Mode.LEARN
                    ? colors.learnMode
                    : colors.primary
            }
            attributes={interrupted ? TextAttributes.DIM : 0}
          >
            ◉
          </text>
          <box flexDirection="row" gap={1}>
            <text>
              {mode === Mode.PLAN
                ? "Plan"
                : mode === Mode.LEARN
                  ? "Learn"
                  : "Build"}
            </text>

            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              &gt;
            </text>
            <text attributes={TextAttributes.DIM}>{model}</text>
            {(duration || interrupted) && (
              <>
                <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
                  &gt;
                </text>
                <text attributes={TextAttributes.DIM}>
                  {interrupted ? "interrupted" : duration || " "}
                </text>
              </>
            )}
          </box>
        </box>
      </box>
    </box>
  );
}
