import {mkdirSync,readFileSync,writeFileSync} from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { DEFAULT_THEME, THEMES, type Theme, type ThemeColors } from "../../theme";
import { createContext, useCallback, useContext, useState } from "react";

const CONFIG_DIR=join(homedir(),".meow");
const THEME_PREFERENCES_PATH=join(CONFIG_DIR,'preferences.json');

type ThemePreferences={
  themeName:string
}
function getInitialTheme():Theme{
  try{
    const preferences=JSON.parse(readFileSync(THEME_PREFERENCES_PATH,'utf8')) as Partial<ThemePreferences>
    const savedTheme=THEMES.find((t)=>t.name===preferences) // find the theme
    return savedTheme?savedTheme:DEFAULT_THEME;
  }catch(e){
    console.log(e);
  }
  return DEFAULT_THEME;
}

function persistTheme(themeName:string){
  try{
    mkdirSync(CONFIG_DIR,{recursive:true}); // recursive make dir
    writeFileSync(THEME_PREFERENCES_PATH,
                  JSON.stringify({themeName} satisfies ThemePreferences,null,2),
                  "utf8"
                 );
  }catch(e){
    console.log(e);
  }
}
type ThemeContextValue={
  colors:ThemeColors,
  currentTheme:Theme,
  setTheme:(theme:Theme)=>void
}
const ThemeContext=createContext<ThemeContextValue|null>(null);
export function useTheme():ThemeContextValue{
  const value=useContext(ThemeContext);
  if(!value) throw new Error("useTheme must be used within ThemeProvider")
  return value
}
type ThemeProviderProps={
  children:React.ReactNode
}
export function ThemeProvider({children}:ThemeProviderProps){
  const [currentTheme,setCurrentTheme]=useState<Theme>(getInitialTheme());
  const setTheme=useCallback((theme:Theme)=>{
    setCurrentTheme(theme);
    persistTheme(theme.name);
  },[])
  const value:ThemeContextValue={colors:currentTheme.colors,currentTheme,setTheme};
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
