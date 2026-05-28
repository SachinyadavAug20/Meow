import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import Header from "./components/header";
import { colors } from "../theme";
import StatusBar from "./components/StatusBar";

function App() {
  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor={colors.bg}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <StatusBar/>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
