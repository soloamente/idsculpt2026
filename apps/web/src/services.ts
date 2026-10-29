import { createAuth } from "@idsculpt26/auth";
import { createDb } from "@idsculpt26/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
