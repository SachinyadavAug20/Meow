import { Outlet } from "react-router";
import { DialogProvider } from "../src/providers/dialog";
import { KeyboardLayerProvider } from "../src/providers/keyboard-layer";
import { ThemeProvider } from "../src/providers/theme";
import { ToastProvider } from "../src/providers/toast";
import { ThemeRoot } from "./theme-root";
import { PromptConfigProvider } from "src/providers/prompt-config";

export function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardLayerProvider>
          <DialogProvider>
            <PromptConfigProvider>
              <ThemeRoot>
                <Outlet />
              </ThemeRoot>
            </PromptConfigProvider>
          </DialogProvider>
        </KeyboardLayerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
