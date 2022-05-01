import { datetime } from "ptera";
import { shouldBackup } from "./core.ts";
import { writeResult } from "./config.ts";
import { readEnv } from "./config.ts";

export const main = async () => {
  const env = readEnv();
  const shells = env
    .filter((e) => {
      const latestDate = datetime(e.date);
      const now = datetime();
      return shouldBackup(latestDate, now);
    })
    .map((e) => e.shell);
  const processes = shells.map(async (shell) => {
    const p = Deno.run({ cmd: ["zsh", shell] });
    const [status, rawError] = await Promise.all([
      p.status(),
      p.stderrOutput(),
    ]);
    if (!status.success) {
      const errorString = new TextDecoder().decode(rawError);
      console.error("execution failed", errorString);
    }
    p.close();
    return {
      shell,
      isOk: status.success,
    };
  });
  const result = await Promise.all(processes);
  writeResult(result);
};

// main();
