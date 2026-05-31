import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import Header from "./components/header";
import { colors } from "../theme";
import { InputBar } from "./components/InputBar";
import { ToastProvider } from "./providers/toast";

function App() {
  const onSubmit = (text: string) => {};
  let disabled = false;
  return (
    <ToastProvider>
      <box
        alignItems="center"
        justifyContent="center"
        backgroundColor={colors.bg}
        width="100%"
        height="100%"
        gap={2}
      >
        <Header />
        <box width="100%" maxWidth={78} maxHeight={8} paddingX={2}>
          <InputBar onSubmit={onSubmit} disabled={disabled} />
        </box>
      </box>
    </ToastProvider>
  );
}

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);
