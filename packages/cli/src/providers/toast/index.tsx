import {createContext,useContext,useRef,useState,useCallback} from "react"
import {useTerminalDimensions} from "@opentui/react"
import type {ToastOptions,ToastVariant} from "./types"
import {DEFAULT_DURATION} from "./types"
import { useTheme } from "../theme";

export type ToastContextValue={
  show:(options:ToastOptions) => void;
};

const ToastContext=createContext<ToastContextValue|null>(null);

export function useToast():ToastContextValue{
  const value=useContext(ToastContext);
  if(!value){
    throw new Error("UseToast must be used within ToastProvider")
  }
  return value;
}

type ToastProviderProps={
  children:React.ReactNode
}
export function ToastProvider({children}:ToastProviderProps){
  const [currentToast,setCurrentToast]=useState<ToastOptions|null>(null);
  const timeoutHandleRef=useRef<NodeJS.Timeout|null>(null);

  const clearCurrentTimeout=useCallback(()=>{
    if(timeoutHandleRef.current){
      clearTimeout(timeoutHandleRef.current)
      timeoutHandleRef.current=null;
    }
  },[])
  const show=useCallback(({variant="info",message,duration=DEFAULT_DURATION}:ToastOptions)=>{
    clearCurrentTimeout();
    setCurrentToast({
      variant,
      message,
      duration
    })
    timeoutHandleRef.current=setTimeout(()=>{
      setCurrentToast(null)
    },duration).unref();
  },[clearCurrentTimeout])

  const value:ToastContextValue={ show, };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast currentToast={currentToast} />
    </ToastContext.Provider>
  )
}

type ToastProps={
  currentToast:ToastOptions|null
}

function Toast({currentToast}:ToastProps){
  const {width}=useTerminalDimensions();
  if(!currentToast) return null;
  const {colors}=useTheme()
  const variantColor:Record<ToastVariant,string> ={
    success:colors.success,
    error:colors.error,
    info:colors.info
  }
  const borderColor=currentToast.variant?variantColor[currentToast.variant]:variantColor.info;
  return(
    <box
      position="absolute"
      justifyContent="center"
      alignSelf="flex-start"
      top={2}
      right={2}
      width={Math.max(1,Math.min(60,width-6))}
      paddingX={2}
      paddingY={1}
      backgroundColor={colors.surface}
      borderColor={borderColor}
      border={["left",'right']}
    >
      <box flexDirection="column" gap={1} width="100%">
        <text fg="#e1e1e1" wrapMode="word" width="100%">
        {currentToast.message}
        </text>
      </box>
    </box>
  )
}
