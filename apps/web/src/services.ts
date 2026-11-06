import { createAuth } from "@idsculpt26/auth";
import { createDb, type Database } from "@idsculpt26/db";

import { ENV } from "./env.server";

type AuthInstance = ReturnType<typeof createAuth>;

function readRuntimeEnv() {
	const secret = ENV.BETTER_AUTH_SECRET;
	const url = ENV.BETTER_AUTH_URL;
	const databaseUrl = ENV.DATABASE_URL;
	if (!secret || !url || !databaseUrl) {
		throw new Error(
			"BETTER_AUTH_SECRET, BETTER_AUTH_URL, and DATABASE_URL must be set",
		);
	}
	return {
		BETTER_AUTH_SECRET: secret,
		BETTER_AUTH_URL: url,
		DATABASE_URL: databaseUrl,
	};
}

// Created on first use so `next build` can finish when those vars are unset.
let dbInstance: Database | undefined;
let authInstance: AuthInstance | undefined;

function getDb() {
	if (!dbInstance) dbInstance = createDb(readRuntimeEnv());
	return dbInstance;
}

function getAuth() {
	if (!authInstance) authInstance = createAuth(readRuntimeEnv(), getDb());
	return authInstance;
}

export const db: Database = new Proxy({} as Database, {
	get(_target, prop, receiver) {
		const real = getDb();
		const value = Reflect.get(real, prop, receiver);
		return typeof value === "function" ? value.bind(real) : value;
	},
});

export const auth: AuthInstance = new Proxy({} as AuthInstance, {
	get(_target, prop, receiver) {
		const real = getAuth();
		const value = Reflect.get(real, prop, receiver);
		return typeof value === "function" ? value.bind(real) : value;
	},
	// better-auth's Next handler checks `"handler" in auth` on each request.
	has(_target, prop) {
		return prop in getAuth();
	},
});
