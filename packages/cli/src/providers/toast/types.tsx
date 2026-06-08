export type ToastVariant = "success" | "info" | "error";

export type ToastOptions= {
  variant: ToastVariant;
  message: string;
  duration?: number;
}

export const DEFAULT_DURATION = 300;
