import { TextAttributes } from "@opentui/core";
import { format } from "date-fns";
import type { InferResponseType } from "hono/client";
import { apiClient } from "lib/api-client";
import { getErrorMessage } from "lib/http-error";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDialog } from "src/providers/dialog";
import { DialogSearchList } from "../dialog-serarch-list";
import { useToast } from "src/providers/toast";

type Session = InferResponseType<
  (typeof apiClient.sessions)["$get"],
  200
>[number];

export const SessionDialogContent = () => {
  const [sessions, setSession] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { close } = useDialog();
  const navigate = useNavigate();
  const {show}=useToast();
  useEffect(() => {
    let ignore = false;
    const fetchSession = async () => {
      try {
        const res = await apiClient.sessions.$get();
        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }
        const data = await res.json();
        if (!ignore) {
          setSession(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          show({
            variant:"error",
            message:"Failed to get session",
          })
          close();
        }
      }
    };
    fetchSession();
    return () => {
      ignore = true;
    };
  }, [close]);
  const handleSelect = useCallback(
    (session: Session) => {
      close();
      navigate(`/session/${session.id}`);
    },
    [close, navigate],
  );
  if (loading) {
    return (
      <box flexDirection="column">
        <text attributes={TextAttributes.DIM}>Loading sessions...</text>
      </box>
    );
  }
  return (
    <DialogSearchList
      items={sessions}
      onSelect={handleSelect}
      filterFn={(s, q) => s.title.toLowerCase().includes(q.toLowerCase())}
      renderItem={(session, isSelected) => (
        <>
          <text selectable={false} fg={isSelected ? "black" : "white"}>
            {session.title}
          </text>
          <box flexGrow={1}></box>
          <text
            selectable={false}
            fg={isSelected ? "black" : undefined}
            attributes={TextAttributes.DIM}
          >
            {format(new Date(session.createdAt), "hh:mm a")}
          </text>
        </>
      )}
      getKey={(s) => s.id}
      placeholder="Search sessions"
      emptyText="No matching session"
    />
  );
};
