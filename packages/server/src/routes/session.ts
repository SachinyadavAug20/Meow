import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { DEFAULT_CHAT_MODEL_ID, findSupportedChatModel } from "@meow/shared";
import { db } from "@meow/database"
import { Role,MessageStatus,Mode } from "@meow/database/enums";

const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z.object({
    role: z.nativeEnum(Role),
    content: z.string(),
    mode: z.nativeEnum(Mode),
    model: z
      .string()
      .refine((id) => !!findSupportedChatModel(id), {
        message: "Unsupported model",
      })
      .default(DEFAULT_CHAT_MODEL_ID),
  }),
});

const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  },
);

const app = new Hono()
  .get("/", async(c) => {
    const result = await db.session.findMany({
      orderBy:{createdAt:"desc"},
      select:{
        id:true,
        title:true,
        createdAt:true
      }
    })
    return c.json(result);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = await db.session.findUnique({
      where:{id},
      include:{
        message:{orderBy:{createdAt:"asc"}}
      }
    })
    if (!session) return c.json({ error: "Session not found" }, 404);
    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {
    const { initialMessage, ...data } = await c.req.valid("json"); // not only get json it give validated data based on given validator

    const session = await db.session.create({
      data:{
        ...data,
        userId:"mock-user",
        ...(initialMessage && {
          message:{
            create:{
              ...initialMessage,
              status:MessageStatus.COMPLETE
            }
          }
        })
      },
      include:{message:true},
    })
    return c.json(session,201);
  });
  export default app;
