import {z} from 'zod';

export const toolCallArgsSchema=z.record(z.string(),z.json()); // it is key-value pairs object where key is string and value is json `keySchema:valueSchema`

// to know what type of message is
export const messagePartSchema=z.discriminatedUnion("type",[
  z.object({
    type:z.literal("reasoning"),
    text:z.string()
  }),
  z.object({
    type:z.literal("tool-call"),
    id:z.string(),
    name:z.string(),
    args:toolCallArgsSchema,
    result:z.string().optional()
  }),
  z.object({
    type:z.literal("text"),
    text:z.string()
  })
])

export const messagePartsSchema=z.array(messagePartSchema);
export type MessagePart=z.infer<typeof messagePartSchema>; // get a type from it

// tool calling argument -> possible thing to get back from VERCEL AI SDK
export const chatStreamEventSchema=z.discriminatedUnion("type",[
  z.object({
    type:z.literal("text-delta"),
    text:z.string()
  }),
  z.object({
    type:z.literal("reasoning-delta"),
    text:z.string()
  }),
  z.object({
    type:z.literal("tool-call"),
    toolCallId:z.string(),
    toolName:z.string(),
    args:toolCallArgsSchema,
  }),
  z.object({
    type:z.literal("tool-result"),
    toolCallId:z.string(),
    result:z.string()
  }),
  z.object({
    type:z.literal("done"),
    messageId:z.string(),
    durationMs:z.string()
  }),
  z.object({
    type:z.literal("error"),
    message:z.string()
  })
]);

export type chatStreamEvent=z.infer<typeof chatStreamEventSchema>;
