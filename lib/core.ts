import type { DateTime } from "ptera";

export const shouldBackup = (
  lastBackupDate: DateTime,
  currentDate: DateTime
): boolean => {
  if (lastBackupDate.year > currentDate.year) {
    throw new Error("invalid last backup date");
  } else if (lastBackupDate.year < currentDate.year) {
    return true;
  } else if (lastBackupDate.month > currentDate.month) {
    throw new Error("invalid last backup date");
  } else if (lastBackupDate.month < currentDate.month) {
    return true;
  }
  return false;
};
