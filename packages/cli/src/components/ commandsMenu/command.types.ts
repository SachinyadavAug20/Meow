import type { Mode } from "@meow/database";
import type { DialogContextValue } from "../../providers/dialog";
import type { ToastContextValue } from "../../providers/toast";
import type { SupportedChatModelId } from "@nightcode/shared";

export interface commandContext{
  exit:()=>void;
  toast:ToastContextValue;
  dialog:DialogContextValue;
  navigate:(path:string)=>void;
  mode:Mode;
  model?:SupportedChatModelId;
  setMode: (mode: Mode) => void;
  setModel: (model: SupportedChatModelId) => void;
}

export interface Command{
  name:string;
  description:string;
  value:string;
  action?:(ctx:commandContext)=>void|Promise<void>;
}

