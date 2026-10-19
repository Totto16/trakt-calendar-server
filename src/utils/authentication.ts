

import { neon } from "@neondatabase/serverless";

export interface User {
    user_id: number;
    secret: string

    "access_token": string
    "expires_at": number
    "refresh_token": string
}


function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("Missing DATABASE_URL")
    }

    const sql = neon(process.env.DATABASE_URL);

    return sql;
}

async function createTables(): Promise<void> {
    const sql = getDb();

    sql`CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        secret VARCHAR(255) NOT NULL,
        access_token TEXT NOT NULL,
        expires_at DATE NOT NULL,
        refresh_token TEXT NOT NULL
    );`
}


export async function getUser(id: number, secret: string): Promise<User | null> {

    const sql = getDb();

    const data = await sql`SELECT * FROM users WHERE
        user_id = ${id}
        AND secret = ${secret}
    ;`;

    if (data.length == 0) {
        return null;
    }

    if (data.length == 1) {
        return data[0] as User;
    }

    throw new Error("Unreachable, multiple ids")
}

export async function getAllUsers(): Promise<User[]> {

    const sql = getDb();

    const data = await sql`SELECT * FROM users;`;

    return data as User[]
}

//TODO: maybe use neon auth
/* import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET,
        // sessionDataTtl: 300, // optional session_data cache TTL in seconds (default: 300)
    },
    // logLevel: 'silent', // disable Managed Better Auth logging
    // logLevel: 'debug',  // verbose proxy/upstream logging
});
 */
