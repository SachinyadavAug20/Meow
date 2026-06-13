import type { DialogContextValue } from "../../providers/dialog";
import type { ToastContextValue } from "../../providers/toast";

export interface commandContext{
  exit:()=>void;
  toast:ToastContextValue;
  dialog:DialogContextValue;
  navigate:(path:string)=>void
}

export interface Command{
  name:string;
  description:string;
  value:string;
  action?:(ctx:commandContext)=>void|Promise<void>;
}

