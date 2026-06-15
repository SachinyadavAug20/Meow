import { resolve, relative } from "path";
import { tool } from "ai";
import { z } from "zod";

const MAX_RESULT = 200;

export function createGlobTool(cwd: string) {
  return tool({
    description:
      "Find files matching a glob pattern, Return file paths relative to the project root.skips node_modules and hidden directories.(and don't look at files which are in .gitignore file)",
    inputSchema: z.object({
      pattern: z
        .string()
        .describe("Glob pattern match (e.g '**/*.ts','src/**/**/*.tsx')"),
      path: z
        .string()
        .describe("relative directory to search in (default to project root)")
        .default("."),
    }),
    execute: async ({ pattern, path }) => {
      const resolved = resolve(cwd, path);
      if (!resolved.startsWith(cwd)) {
        return { error: "path is outside the project directory" };
      }
      try {
        const glob = new Bun.Glob(pattern);
        const files: string[] = [];
        let truncated = false;
        for await (const match of glob.scan({
          cwd: resolved,
          dot: false,
          onlyFiles: true,
        })) {
          // skips
          if (match.includes("node_modules")) continue;
          if (match.includes(".env")) continue;
          if (files.length >= MAX_RESULT) {
            truncated = true;
            break;
          }
          const absoluteMatch = resolve(resolved, match);
          files.push(relative(cwd, absoluteMatch));
        }
        files.sort();
        return {
          files,
          ...(truncated ? { truncated: true } : {}),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to execute glob: ${message}` };
      }
    },
  });
}
