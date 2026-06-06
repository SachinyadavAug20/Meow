import Header from "../src/components/header";
import { InputBar } from "../src/components/InputBar";
import { useTheme } from "../src/providers/theme";

export function ThemeRoot({children}: {children: React.ReactNode}) {
  const { colors } = useTheme();
  const onSubmit = (text: string) => {};
  let disabled = false;
  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor={colors.background}
      width="100%"
      height="100%"
      flexGrow={1}
      gap={2}
    >
    {children}
    </box>
  );
}
