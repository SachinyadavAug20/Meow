// will be a able to open a dialog
// will be able to close a dialog
// it is like alert for TUI

import { createContext, useCallback, useContext, useState } from "react";
import type { dialogConfig } from "./types";
import { useKeyboardLayer } from "../keyboard-layer";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { RGBA, TextAttributes } from "@opentui/core";
import { useTheme } from "../theme";

export type DialogContextValue = {
  open: (config: dialogConfig) => void;
  close: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const value = useContext(DialogContext);
  if (!value) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return value;
}

type DialogProviderProps = {
  children: React.ReactNode;
};
export function DialogProvider({ children }: DialogProviderProps) {
  const [currentDialog, setCurrentDialog] = useState<dialogConfig | null>(null);
  const { push, pop } = useKeyboardLayer();
  const close = useCallback(() => {
    setCurrentDialog(null);
    pop("dialog");
  }, [pop]);
  const open = useCallback((config: dialogConfig) => {
    setCurrentDialog(config);
    push("dialog", () => {
      close();
      return true;
    });
  }, []);
  const value: DialogContextValue = { open, close };
  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog currentDialog={currentDialog} close={close} />
    </DialogContext.Provider>
  );
}

type DialogProps = {
  currentDialog: dialogConfig | null;
  close: () => void;
};
function Dialog({ currentDialog, close }: DialogProps) {
  const { isTopLayer } = useKeyboardLayer();
  const dimesion = useTerminalDimensions();
  const {colors}=useTheme()
  useKeyboard((key) => {
    if (!currentDialog || !isTopLayer("dialog")) return; // if no dialog open or not on top layer
    if (key.name === "escape") {
      close();
    }
  });
  if (!currentDialog) {
    return null;
  }
  const { title, children } = currentDialog;
  return (
    <box
      position="absolute"
      top={0}
      left={0}
      width={dimesion.width}
      height={dimesion.height}
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)}
      zIndex={100}
      onMouseDown={() => close()}
      justifyContent="center"
      alignItems="center"
    >
      <box
        width={Math.min(60, dimesion.width - 4)}
        height="auto"
        backgroundColor={colors.dialogSurface}
        paddingX={4}
        paddingY={1}
        flexDirection="column"
        gap={1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <box
          paddingBottom={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <text attributes={TextAttributes.BOLD}>{title}</text>
          <text attributes={TextAttributes.DIM} onMouseDown={() => close()}>
            esc
          </text>
        </box>
        <box flexGrow={1}>{children}</box>
      </box>
    </box>
  );
}
