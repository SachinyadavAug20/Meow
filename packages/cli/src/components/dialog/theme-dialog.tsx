import { useCallback, useEffect, useRef } from "react";
import { useDialog } from "../../providers/dialog"
import { useTheme } from "../../providers/theme";
import { THEMES, type Theme } from "../../theme";
import { DialogSearchList } from "../dialog-serarch-list";


export const ThemeDialogContent=()=>{
  const dialog=useDialog();
  const {setTheme,currentTheme}=useTheme();
  // as preview theme so keep track of orignal 
  const originalThemeRef=useRef(currentTheme);
  const confirmedThemeRef=useRef(false);

  useEffect(()=>{
    return ()=>{
      if(!confirmedThemeRef.current){
        // if not selected set back to orignal theme
        setTheme(originalThemeRef.current)
      }
    }
  },[setTheme])

  const handleSelectTheme=useCallback((theme:Theme)=>{
    confirmedThemeRef.current=true;
    setTheme(theme);
    dialog.close();
  },[setTheme,dialog])
  const handleHighlight=useCallback((theme:Theme)=>{
    setTheme(theme);
  },[setTheme])
  return (
    <DialogSearchList
    items={THEMES}
    onSelect={handleSelectTheme}
    onHighlight={handleHighlight}
    filterFn={(t,query)=>t.name.toLowerCase().includes(query.toLowerCase())}
    renderItem={(theme,isSelected)=>{
      return (
        <text selectable={false} fg={isSelected?"black":"white"}>
        {theme.name===originalThemeRef.current.name?"\u0020\u25B6\u0020":"\u0020\u0020\u0020"}
        {theme.name}
        </text>
      )
    }}
    getKey={(t)=>t.name}
    placeholder="Search themes"
    emptyText="No matching themes"
    />
  )
}
