import { SessionDialogContent, ThemeDialogContent } from "../dialog";
import type { Command } from "./command.types";

export const COMMANDS: Command[] = [
  {
    name: "new",
    description: "Start a new conversation",
    value: "/new",
    action:(ctx)=>{
      ctx.toast.show({message:"Starting a new conversation...",variant:"success",duration:3000})
    }
  },
  {
    name: "agents",
    description: "Switch agent",
    value: "/agents",
    action:(ctx)=>{
      ctx.dialog.open({
        title:"Select Agent",
        children:<text>Agent selection ...</text>
      })
    }
  },
  {
    name: "model",
    description: "Select a model",
    value: "/model",
    action:(ctx)=>{
      ctx.dialog.open({
        title:"Select Model",
        children:<text>Model selection ...</text>
      })
    }
  },
  {
    name: "session",
    description: "Show your conversation history",
    value: "/session",
    action:(ctx)=>{
      ctx.dialog.open({
        title:"Session",
        children:<SessionDialogContent/>
      })
    }
  },
  {
    name: "theme",
    description: "Change the color theme",
    value: "/theme",
    action:(ctx)=>{
      ctx.dialog.open({
        title:"Select Theme",
        children:<ThemeDialogContent/>
      })
    }
  },
  {
    name: "login",
    description: "Sign in to your account",
    value: "/login",
    action:(ctx)=>{
      ctx.toast.show({message:"Opening browser...",variant:"success",duration:3000})
    }
  },
  {
    name: "logout",
    description: "Sign out of your account",
    value: "/logout",
    action:(ctx)=>{
      ctx.toast.show({message:"Opening browser...",variant:"success",duration:3000})
    }
  },
  {
    name: "upgrade",
    description: "Buy more credits",
    value: "/upgrade",
    action:(ctx)=>{
      ctx.toast.show({message:"Opening browser...",variant:"success",duration:3000})
    }
  },
  {
    name: "usage",
    description: "Open billing portal in your browser",
    value: "/usage",
    action:(ctx)=>{
      ctx.toast.show({message:"Opening browser...",variant:"success",duration:3000})
    }
  },
  {
    name: "help",
    description: "Show help",
    value: "/help",
    action:(ctx)=>{
      ctx.toast.show({message:"help menu...",variant:"success",duration:3000})
    }
  },
  {
    name: "exit",
    description: "Exit the application",
    value: "/exit",
    action: (ctx) => {
      ctx.toast.show({message:"Thanks for using meow",variant:"success",duration:3000})
      setTimeout(()=>{
        ctx.exit();
      },1000)
    },
  },
];
