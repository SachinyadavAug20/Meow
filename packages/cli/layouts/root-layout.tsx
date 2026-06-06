import { Outlet } from "react-router";
import { DialogProvider } from "../src/providers/dialog";
import { KeyboardLayerProvider } from "../src/providers/keyboard-layer";
import { ThemeProvider } from "../src/providers/theme";
import { ToastProvider } from "../src/providers/toast";
import { ThemeRoot } from "./theme-root";

export function RootLayout() {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <ThemeRoot>
              <Outlet />
            </ThemeRoot>
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
}
