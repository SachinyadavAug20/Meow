import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null; stack: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, stack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ stack: info.componentStack || "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <box flexDirection="column" paddingX={2} paddingY={1}>
          <text fg="red">Error: {this.state.error?.message}</text>
          {this.state.stack && (
            <text dimColor>{this.state.stack.slice(0, 500)}</text>
          )}
        </box>
      );
    }
    return this.props.children;
  }
}
