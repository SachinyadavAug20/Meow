export interface commandContext{
  exit:()=>void;
}

export interface Command{
  name:string;
  description:string;
  value:string;
  action?:(ctx:commandContext)=>void|Promise<void>;
}

