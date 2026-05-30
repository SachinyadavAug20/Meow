import type { Command } from "./command.types";

export const COMMANDS: Command[] = [
  {
    name: "new",
    description: "Start a new conversation",
    value: "/new",
  },
  {
    name: "agents",
    description: "Switch agent",
    value: "/agents",
  },
  {
    name: "model",
    description: "Select a model",
    value: "/model",
  },
  {
    name: "session",
    description: "Show your conversation history",
    value: "/session",
  },
  {
    name: "theme",
    description: "Change the color theme",
    value: "/theme",
  },
  {
    name: "login",
    description: "Sign in to your account",
    value: "/login",
  },
  {
    name: "logout",
    description: "Sign out of your account",
    value: "/logout",
  },
  {
    name: "upgrade",
    description: "Buy more credits",
    value: "/upgrade",
  },
  {
    name: "usage",
    description: "Open billing portal in your browser",
    value: "/usage",
  },
  {
    name: "help",
    description: "Show help",
    value: "/help",
  },
  {
    name: "exit",
    description: "Exit the application",
    value: "/exit",
    action: (ctx) => {
      ctx.exit();
    },
  },
];
