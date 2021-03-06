import { assertEquals } from "testing/asserts.ts";
import { shouldBackup } from "./core.ts";
import { datetime } from "ptera";

Deno.test("should run backup", () => {
  const lastBackupDate = datetime("2022-04-30");
  const currentDate = datetime("2022-05-01");
  const result = shouldBackup(lastBackupDate, currentDate);
  assertEquals(result, true);
});

Deno.test("should run backup if delayed", () => {
  const lastBackupDate = datetime("2022-03-30");
  const currentDate = datetime("2022-05-01");
  const result = shouldBackup(lastBackupDate, currentDate);
  assertEquals(result, true);
});

Deno.test("should not run backup", () => {
  const lastBackupDate = datetime("2022-04-15");
  const currentDate = datetime("2022-04-30");
  const result = shouldBackup(lastBackupDate, currentDate);
  assertEquals(result, false);
});
