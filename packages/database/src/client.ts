import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import path from "node:path"

dotenv.config({
  path:path.resolve(import.meta.dirname,"../../../.env")
})

const dataBaseURL=process.env.DATABASE_URL;
if(!dataBaseURL){
  throw new Error("DATABASE_URL is not set")
}
const adapter=new PrismaPg({connectionString:dataBaseURL})
export const db=new PrismaClient({adapter})
