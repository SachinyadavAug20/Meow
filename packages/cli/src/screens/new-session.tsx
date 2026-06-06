import {  useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function NewSession() {
  const navigation = useNavigate();
  const location = useLocation();

  const state = location.state as { message?: string } | null; // way to access params
  useEffect(() => {
    if (!state?.message) {
      navigation("/", { replace: true });
    }
  },[state,navigation]);
  if (!state?.message) return null;

  return(
    <box flexGrow={1} padding={2} flexDirection="column" gap={1}>
      <text>Creating session...</text>
      <text>{state.message}</text>
    </box>
  )
}
