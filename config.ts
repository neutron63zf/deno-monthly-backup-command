import * as z from "zod";

const ENV_JSON_PATH = "./env.json";

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
  const text = Deno.readTextFileSync(filePath);
  return JSON.parse(text);
};

export const writeJSON = (filePath: string, data: JSONValuedType): void => {
  const text = JSON.stringify(data, null, "\t");
  Deno.writeTextFileSync(filePath, text);
};

const envSchema = z.object({
  FULL_BACKUP_COMMANDS: z.array(z.string()),
  LATEST_BACKUP_DATE_FILE: z.string(),
});

const latestDateSchema = z.array(
  z.object({
    command: z.string(),
    date: z.string(),
  })
);

type LatestDate = z.infer<typeof latestDateSchema>;

export const readEnv = () => {
  const env = envSchema.parse(readJSON(ENV_JSON_PATH));
  const latestDates = latestDateSchema.parse(
    readJSON(env.LATEST_BACKUP_DATE_FILE)
  );
  return env.FULL_BACKUP_COMMANDS.map((command) => {
    const latestDate = latestDates.find((d) => d.command == command);
    if (latestDate === undefined) {
      return {
        command,
        date: new Date(0).toISOString(),
      };
    }
    return latestDate;
  });
};

export type Result = {
  command: string;
  isOk: boolean;
}[];

export const writeResult = (result: Result) => {
  const env = envSchema.parse(readJSON(ENV_JSON_PATH));
  const latestDatesPath = env.LATEST_BACKUP_DATE_FILE;
  const latestDates = latestDateSchema.parse(readJSON(latestDatesPath));
  const data: LatestDate = result.map((r) => ({
    command: r.command,
    date: r.isOk
      ? new Date().toISOString()
      : latestDates.find((d) => d.command === r.command)?.date || "",
  }));
  writeJSON(latestDatesPath, data);
};
