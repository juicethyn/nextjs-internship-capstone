import type { db } from "../lib/db";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbClient = typeof db | Transaction;
