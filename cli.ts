import { Command } from "cliffy";
import { main } from "./index.ts";

await new Command().name("monthly-backup").parse(Deno.args);

main();
