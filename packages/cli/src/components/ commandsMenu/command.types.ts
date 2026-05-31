import type { ToastContextValue } from "../../providers/toast";

export interface commandContext{
  exit:()=>void;
  toast:ToastContextValue
}

export interface Command{
  name:string;
  description:string;
  value:string;
  action?:(ctx:commandContext)=>void|Promise<void>;
}

