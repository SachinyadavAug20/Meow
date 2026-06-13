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
  dimSeparator:string,
  learnMode:string,
}

export type Theme={
  name:string,
  colors:ThemeColors
}

export const THEMES: Theme[] = [
  {
    name: "NightFox",
    colors: {
      primary: "#56D6C2",
      planMode: "#E0AF68",      // Warm Amber
      learnMode: "#81A1C1",     // Frost Blue
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
    name: "OneDark",
    colors: {
      primary: "#61AFEF",
      planMode: "#D19A66",      // Vivid Orange
      learnMode: "#4KC3D0",     // Calm Teal
      selection: "#3E4452",
      thinking: "#C678DD",
      success: "#98C379",
      error: "#E06C75",
      info: "#61AFEF",
      background: "#282C34",
      surface: "#3A3F4B",
      dialogSurface: "#21252B",
      thinkingBorder: "#4B5263",
      dimSeparator: "#5C6370",
    }
  },
  {
    name: "Nord",
    colors: {
      primary: "#88C0D0",
      planMode: "#EBCB8B",      // Nord Yellow
      learnMode: "#A3BE8C",     // Nord Sage Green
      selection: "#4C566A",
      thinking: "#B48EAD",
      success: "#A3BE8C",
      error: "#BF616A",
      info: "#88C0D0",
      background: "#2E3440",
      surface: "#3B4252",
      dialogSurface: "#242933",
      thinkingBorder: "#434C5E",
      dimSeparator: "#4C566A",
    }
  },
  {
    name: "Tokyonight",
    colors: {
      primary: "#7AA2F7",
      planMode: "#FF9E3B",      // Autumn Orange
      learnMode: "#1ABC9C",     // Deep Turquoise
      selection: "#364A82",
      thinking: "#BB9AF7",
      success: "#9ECE6A",
      error: "#F7768E",
      info: "#7AA2F7",
      background: "#1A1B26",
      surface: "#24283B",
      dialogSurface: "#16161E",
      thinkingBorder: "#414868",
      dimSeparator: "#545C7E",
    }
  },
  {
    name: "SolarizedDark",
    colors: {
      primary: "#268BD2",
      planMode: "#CB4B16",      // Solarized Orange
      learnMode: "#2AA198",     // Solarized Cyan
      selection: "#073642",
      thinking: "#6C71C4",
      success: "#859900",
      error: "#DC322F",
      info: "#268BD2",
      background: "#002B36",
      surface: "#073642",
      dialogSurface: "#042028",
      thinkingBorder: "#586E75",
      dimSeparator: "#586E75",
    }
  },
  {
    name: "Synthwave84",
    colors: {
      primary: "#F877F8",
      planMode: "#FFD300",      // Retained Neon Yellow for Planning
      learnMode: "#39FF14",     // Neon Focus Green for Learning
      selection: "#4B0082",
      thinking: "#FF628C",      // Swapped Thinking to Hot Pink
      success: "#00FFEF",
      error: "#FF073A",
      info: "#F877F8",
      background: "#2D2A4F",
      surface: "#3B3766",
      dialogSurface: "#211E3B",
      thinkingBorder: "#6A0DAD",
      dimSeparator: "#8A2BE2",
    }
  },
  {
    name: "Palenight",
    colors: {
      primary: "#82AAFF",
      planMode: "#F78C6C",      // Coral Orange
      learnMode: "#4EE0D0",     // Soft Bright Teal
      selection: "#4A4D62",
      thinking: "#C792EA",
      success: "#C3E88D",
      error: "#FF5370",
      info: "#82AAFF",
      background: "#292D3E",
      surface: "#363A50",
      dialogSurface: "#202331",
      thinkingBorder: "#4A4D62",
      dimSeparator: "#676E95",
    }
  },
  {
    name: "CatppuccinMacchiato",
    colors: {
      primary: "#8AADF4",
      planMode: "#F5A97F",      // Catppuccin Peach
      learnMode: "#94E2D5",     // Catppuccin Mint
      selection: "#414559",
      thinking: "#C6A0F6",
      success: "#A6DA95",
      error: "#EE6050",
      info: "#8AADF4",
      background: "#24273A",
      surface: "#363A4F",
      dialogSurface: "#181926",
      thinkingBorder: "#5B6078",
      dimSeparator: "#6E738D",
    }
  },
  {
    name: "Dracula",
    colors: {
      primary: "#8BE9FD",
      planMode: "#FFB86C",      // Dracula Orange
      learnMode: "#50FA7B",     // Bright Dracula Green
      selection: "#44475A",
      thinking: "#FF79C6",
      success: "#F1FA8C",       // Mapped to soft yellow
      error: "#FF5555",
      info: "#8BE9FD",
      background: "#282A36",
      surface: "#343746",
      dialogSurface: "#1D1E26",
      thinkingBorder: "#6272A4",
      dimSeparator: "#BD93F9",
    }
  },
  {
    name: "GruvboxDark",
    colors: {
      primary: "#83A598",
      planMode: "#FE8019",      // Gruvbox Bright Orange
      learnMode: "#8EC07C",     // Gruvbox Aqua
      selection: "#3C3836",
      thinking: "#D3869B",
      success: "#B8BB26",
      error: "#FB4934",
      info: "#83A598",
      background: "#282828",
      surface: "#3C3836",
      dialogSurface: "#202020",
      thinkingBorder: "#928374",
      dimSeparator: "#A89984",
    }
  },
  {
    name: "AtomDark",
    colors: {
      primary: "#52EDFF",
      planMode: "#E5C07B",      // Soft Gold
      learnMode: "#73DACA",     // Electric Mint
      selection: "#3E4452",
      thinking: "#C594C5",
      success: "#9DDD7F",
      error: "#FC5F5F",
      info: "#52EDFF",
      background: "#1E1E2C",
      surface: "#2D2D44",
      dialogSurface: "#1B1B27",
      thinkingBorder: "#5A5B79",
      dimSeparator: "#7B7EA2",
    }
  },
  {
    name: "AyuDark",
    colors: {
      primary: "#59C2FF",
      planMode: "#FFB454",      // Ayu Warm Gold
      learnMode: "#95E6CB",     // Ayu Mint Green
      selection: "#363C4A",
      thinking: "#D4BFFF",
      success: "#BAE67E",
      error: "#FF3333",
      info: "#59C2FF",
      background: "#0A0E14",
      surface: "#1D2330",
      dialogSurface: "#080B10",
      thinkingBorder: "#5C6A72",
      dimSeparator: "#6D7B87",
    }
  },
  {
    name: "MonokaiPro",
    colors: {
      primary: "#78DCE8",
      planMode: "#FC9867",      // Monokai Tangerine
      learnMode: "#A9DC76",     // Monokai Green
      selection: "#49483E",
      thinking: "#FF6188",
      success: "#78DCE8",       // Mapped to sky blue
      error: "#FC4040",
      info: "#78DCE8",
      background: "#2D2A2E",
      surface: "#3E3B3E",
      dialogSurface: "#211F22",
      thinkingBorder: "#666063",
      dimSeparator: "#99909B",
    }
  },
  {
    name: "OceanicNext",
    colors: {
      primary: "#6699CC",
      planMode: "#F99157",      // Oceanic Orange
      learnMode: "#5FB3B3",     // Oceanic Teal
      selection: "#3B4252",
      thinking: "#C594C7",
      success: "#99C794",
      error: "#EC5F67",
      info: "#6699CC",
      background: "#1B2B34",
      surface: "#2D3E4C",
      dialogSurface: "#16222A",
      thinkingBorder: "#5A6D7C",
      dimSeparator: "#7B8E9C",
    }
  },
  {
    name: "ArcDark",
    colors: {
      primary: "#5294E2",
      planMode: "#46AFA5",      // Seafoam/Teal
      learnMode: "#7BC8A4",     // Soft Mint Green
      selection: "#343E4B",
      thinking: "#AB75CE",
      success: "#8BBF4A",
      error: "#D44F4F",
      info: "#5294E2",
      background: "#2F343F",
      surface: "#3A4350",
      dialogSurface: "#292D37",
      thinkingBorder: "#67707D",
      dimSeparator: "#8591A0",
    }
  },
  {
    name: "Andromeda",
    colors: {
      primary: "#BB80B3",
      planMode: "#FFE66D",      // Canary Plan Yellow
      learnMode: "#00E2B2",     // Cyber Aquamarine
      selection: "#3A3E4E",
      thinking: "#00C5C7",
      success: "#85E86E",
      error: "#FF4747",
      info: "#BB80B3",
      background: "#272935",
      surface: "#313440",
      dialogSurface: "#1F212B",
      thinkingBorder: "#5C6173",
      dimSeparator: "#7C829B",
    }
  },
  {
    name: "Cobalt2",
    colors: {
      primary: "#0088FF",
      planMode: "#FF9D00",      // Golden Amber
      learnMode: "#2AFFD0",     // Electric Seafoam
      selection: "#1F3B66",
      thinking: "#FF628C",
      success: "#3AD900",
      error: "#FFC66D",
      info: "#0088FF",
      background: "#193549",
      surface: "#224056",
      dialogSurface: "#152C3E",
      thinkingBorder: "#6E8898",
      dimSeparator: "#8A9BAA",
    }
  }
];

export const DEFAULT_THEME:Theme=THEMES[0]!
