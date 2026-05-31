import {createContext,useContext,useRef,useState,useCallback} from "react"
import {useTerminalDimensions} from "@opentui/react"
import type {ToastOptions,ToastVariant} from "./types"
import {DEFAULT_DURATION} from "./types"

export type ToastContextValue={
  show:(options:ToastOptions) => void;
};

const ToastContext=createContext<ToastContextValue|null>(null);

export function useToast():ToastContextValue{
  const value=useContext(ToastContext);
  if(!value){
    throw new Error("UseToast must be used within ToastProvider")
  }
}
