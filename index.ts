import { datetime } from "ptera";
import { shouldBackup } from "./core.ts";
import { writeResult } from "./config.ts";
import { readEnv } from "./config.ts";

const main = async () => {
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
    const status = await p.status();
    p.close();
    if (!status.success) {
      const rawError = await p.stderrOutput();
      const errorString = new TextDecoder().decode(rawError);
      console.error("execution failed", errorString);
    }
    return {
      shell,
      isOk: status.success,
    };
  });
  const result = await Promise.all(processes);
  writeResult(result);
};

main();
