import type { Session } from "@idsculpt26/auth";
import type { Database } from "@idsculpt26/db";

export type Context = {
  session: Session | null;
  db: Database;
};
