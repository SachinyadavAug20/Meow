import { tool } from "ai";
import { resolve, relative } from "path";
import { readFile, writeFile } from "fs/promises";
import { string, z } from "zod";

export function createEditFileTool(cwd: string) {
  return tool({
    description:
      "Make a targeted edit to a file by replacing an exact string match. The oldString must appear exactly once in the file (for safety). Use this for surgical edits instead of rewriting entire files.",
    inputSchema: z.object({
      path: z.string().describe("Relative path to file to edit"),
      oldString: z
        .string()
        .describe(
          "The exact text to find and replace(must be unique in the file)",
        ),
      newString: z.string().describe("The text to replace it with"),
    }),
    execute: async ({ path, oldString, newString }) => {
      const resolved=resolve(cwd,path);
      if(!resolved.startsWith(cwd)){ // safety
        return {error:"Path is outside of the project directory"};
      }
      try {
        const content = await readFile(resolved,"utf8");
        const occurence = content.split(oldString).length - 1;
        if(occurence===0){
          return {error:`Could not find ${oldString} in ${relative(cwd,resolved)}`}
        }
        if(occurence>1){
          return {
            error:`oldString is ambiguous - found ${occurence} matches.Provider more surrounding context to make it unique`,
          }
        }
        const updated=content.replace(oldString,newString);
        await writeFile(resolved,updated,"utf8");
        return {
          success:true as const,
          path:relative(cwd,resolved)
        }
      } catch (error){
        const message=error instanceof Error?error.message:String(error);
        return {error:`Failed to edit file: ${message}`};
      }
    },
  });
}
