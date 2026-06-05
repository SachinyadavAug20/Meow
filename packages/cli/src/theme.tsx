export type ThemeColors={
  primary:string,
  planMode:string,
  selection:string,
  thinking:string,
  success:string,
  error:string,
  info:string,
  background:string,
  surface:string,
  dialogSurface:string,
  thinkingBorder:string,
  dimSeparator:string
}

export type Theme={
  name:string,
  colors:ThemeColors
}

export const THEMES:Theme[]=[
  {
    name:"NightFox",
    colors: {
      primary: "#56D6C2",
      planMode: "#CF8EF4",
      selection: "#89B4FA",
      thinking: "#CF8EF4",
      success: "#82E0AA",
      error: "#E74C5E",
      info: "#56D6C2",
      background: "#0D0D12",
      surface: "#1A1A24",
      dialogSurface: "#0A0A10",
      thinkingBorder: "#34344A",
      dimSeparator: "#4E4E66",
    }
  },
    {
    name: "SkylineDaydream",
    colors: {
      primary: "#6A9955", 
      planMode: "#C594C5", 
      selection: "#89CFF0", 
      thinking: "#C594C5", 
      success: "#8AD08A",
      error: "#F48D8D", 
      info: "#6A9955", 
      background: "#F5F5F5", 
      surface: "#E0E0E0", 
      dialogSurface: "#FFFFFF",
      thinkingBorder: "#BCCBD6",
      dimSeparator: "#C8C8C8", 
    }
  }
  
]

export const DEFAULT_THEME:Theme=THEMES[0]!
