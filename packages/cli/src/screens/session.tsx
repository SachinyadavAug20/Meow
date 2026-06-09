import type { InferResponseType } from "hono";
import { SessionShell } from "../components/session-shell";
import {z} from "zod"
import { apiClient } from "lib/api-client";
import { BotMessage, ErrorMessage, UserMessage } from "src/components/message";
import { useLocation, useNavigate, useParams } from "react-router";
import { useToast } from "src/providers/toast";
import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "lib/http-error";

type SessionData=InferResponseType<(typeof apiClient.sessions)[":id"]["$get"],200>;
const sessionLocationSchema=z.object({
  session:z.custom<SessionData>((val)=>val!=null && typeof val==="object" && "id" in val),
})
function ChatMessage({msg}:{msg:SessionData["message"][number]}){ // which message to display user,bot or error message
  if(msg.role==="USER"){
    return <UserMessage message={msg.content}/>
  }
  if(msg.role==="ERROR"){
    return <ErrorMessage message={msg.content}/>
  }
  return <BotMessage model={msg.model} content={msg.content}/>
}


export function Session() {
  const {id}=useParams();
  const location=useLocation();
  const navigate=useNavigate();
  const toast=useToast();

  // two way to reach this page // 1.from session list
                                // 2.from new session redirect
  // if comes from new session redirect -> it will have session then why to wait for it to save to DB and then here wait to get it from DB
  // thus use a prefetch to check if have session in it(i.e session is newly created and)
  const prefetched=useMemo(()=>{
    // is session in the data
    const parsed=sessionLocationSchema.safeParse(location.state);
    return parsed.success?parsed.data.session:null;
  },[location.state])
  const [session,setSession] = useState<SessionData |null>(prefetched);
  useEffect(()=>{
    if(prefetched) return;
    setSession(null);
    if(!id) return;
    let ignore=false;
    const fetchSession=async()=>{
      try {
         const res=await apiClient.sessions[":id"].$get({param:{id}});
         if(ignore) return;
         if(!res.ok) throw new Error(await getErrorMessage(res));
         setSession(await res.json());
      } catch (error) {
        if(ignore) return;
        toast.show({
          variant:"error",
          message:error instanceof Error?error.message:"Failed to get session",
        })
        navigate("/",{replace:true})
      }
    }
    fetchSession();
    return ()=>{
      ignore=true
    }
  },[id,prefetched,toast,navigate])
  if(!session){
    return <SessionShell onSubmit={()=>{}}inputDisabled loading><text>No session</text></SessionShell>
  }
  return (
    <SessionShell onSubmit={() => {}} >
    {session.message.map((msg)=>(
      <ChatMessage key={msg.id} msg={msg}/>
    ))}
    </SessionShell>
  );
}
