import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme";
import { usePromptConfig } from "src/providers/prompt-config";
import { Mode } from "@meow/database";

const StatusBar = () => {
  const { mode, model } = usePromptConfig();
  const { colors } = useTheme();
  return (
    <box flexDirection="row" gap={1}>
      <text
        fg={
          mode === Mode.PLAN
            ? colors.planMode
            : mode === Mode.LEARN
              ? colors.learnMode
              : colors.primary
        }
      >
        {mode === Mode.PLAN ? "Plan" : mode === Mode.LEARN ? "Learn" : "Build"}
      </text>

      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        &#8250;
      </text>
      <text>{model}</text>
    </box>
  );
};

export default StatusBar;
