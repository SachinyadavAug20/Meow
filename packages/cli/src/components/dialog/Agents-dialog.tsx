import { useCallback } from "react";
import { useDialog } from "../../providers/dialog"
import { DialogSearchList } from "../dialog-serarch-list";
import { Mode } from "@meow/database";

const AVALABLE_MODES:Mode[]=[Mode.BUILD,Mode.PLAN]

type AgentsDialogProps={
  currentMode:Mode,
  onSelect:(mode:Mode)=>void
}
function getModeLabel(mode:Mode){
  return mode===Mode.PLAN?"Plan":"Build";
}

export const AgentsDialogContent=({currentMode,onSelect}:AgentsDialogProps)=>{
  const dialog=useDialog();
  const handleSelect=useCallback((nextMode:Mode)=>{
    onSelect(nextMode);
    dialog.close();
  },[dialog,onSelect])

  return (
    <DialogSearchList
    items={AVALABLE_MODES}
    onSelect={handleSelect}
    filterFn={(i,query)=>getModeLabel(i).toLowerCase().includes(query.toLowerCase())}
    renderItem={(i,isSelected)=>{
      return (
        <text selectable={false} fg={isSelected?"black":"white"}>
        {i===currentMode?"\u0020\u25B6\u0020":"\u0020\u0020\u0020"}
        {getModeLabel(i)}
        </text>
      )
    }}
    getKey={(i)=>getModeLabel(i)}
    placeholder="Search agents"
    emptyText="No matching modes"
    />
  )
}
