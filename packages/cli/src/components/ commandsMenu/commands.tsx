import type { Command } from "./command.types";

export const COMMANDS:Command[]=[
  {
    name:"new",
    description:"Start a new conversation",
    value:"/new"
  },
  {
    name:"exit",
    description:"Exit the application",
    value:"/exit",
    action:(ctx)=>{
      ctx.exit();
    }
  },
  {
    name:"help",
    description:"Show help",
    value:"/help"
  }
  
]
