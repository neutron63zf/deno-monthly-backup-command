import * as z from "zod";
import { readAllSync } from "streams/conversion.ts";

const ENV_JSON_PATH =
  Deno.env.get("MONTHLY_BACKUP_ENV_JSON_PATH") || "./.env.json";

type JSONValuedType =
  | null
  | boolean
  | number
  | string
  | {
      [key: string]: JSONValuedType;
    }
  | JSONValuedType[];

export const readJSON = (filePath: string): JSONValuedType => {
  const file = Deno.openSync(filePath, {
    read: true,
    write: true,
    create: true,
  });
  const decoder = new TextDecoder("utf-8");
  const content = readAllSync(file);
  Deno.close(file.rid);
  const text = decoder.decode(content) || "";
  console.log("text:", text);
  return JSON.parse(text);
};

export const writeJSON = (filePath: string, data: JSONValuedType): void => {
  const text = JSON.stringify(data, null, "\t");
  Deno.writeTextFileSync(filePath, text);
};

const envSchema = z.object({
  FULL_BACKUP_SHELL: z.array(z.string()),
  LATEST_BACKUP_DATE_FILE: z.string(),
});

const latestDateSchema = z.array(
  z.object({
    shell: z.string(),
    date: z.string(),
  })
);

type LatestDate = z.infer<typeof latestDateSchema>;

export const readEnv = () => {
  const env = envSchema.parse(readJSON(ENV_JSON_PATH));
  const latestDates = latestDateSchema.parse(
    readJSON(env.LATEST_BACKUP_DATE_FILE)
  );
  return env.FULL_BACKUP_SHELL.map((shell) => {
    const latestDate = latestDates.find((d) => d.shell == shell);
    if (latestDate === undefined) {
      return {
        shell,
        date: new Date(0).toISOString(),
      };
    }
    return latestDate;
  });
};

export type Result = {
  shell: string;
  isOk: boolean;
}[];

export const writeResult = (result: Result) => {
  const env = envSchema.parse(readJSON(ENV_JSON_PATH));
  const latestDatesPath = env.LATEST_BACKUP_DATE_FILE;
  const latestDates = latestDateSchema.parse(readJSON(latestDatesPath));
  const data: LatestDate = result.map((r) => ({
    shell: r.shell,
    date: r.isOk
      ? new Date().toISOString()
      : latestDates.find((d) => d.shell === r.shell)?.date || "",
  }));
  writeJSON(latestDatesPath, data);
};
