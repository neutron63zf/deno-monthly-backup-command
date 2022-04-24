import { writeResult } from "./config.ts";
import { readEnv } from "./config.ts";

const main = async () => {
  const env = readEnv();
  const commands = env.map((e) => e.command);
  const processes = commands.map(async (command) => {
    const p = Deno.run({ cmd: [command] });
    const status = await p.status();
    p.close();
    if (!status.success) {
      const rawError = await p.stderrOutput();
      const errorString = new TextDecoder().decode(rawError);
      console.error("execution failed", errorString);
    }
    return {
      command,
      isOk: status.success,
    };
  });
  const result = await Promise.all(processes);
  writeResult(result);
};

main();
