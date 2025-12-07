import type { Pool, PoolClient } from "pg";
import { pool } from "./config";
import type { Request } from "express";

type newUser = {
  name: string;
  email: string;
  email_verified: boolean;
  password: string | undefined;
};

type User = {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  password: string | undefined;
};

export async function findUserByEmail(email: string) {
  const r = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return r.rows[0];
}

export async function findUserById(id: number) {
  const r = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return r.rows[0];
}
// defaults to pool if no client is passed
export async function createUser(user: newUser, client: Pool | PoolClient = pool): Promise<User> {
  const r = await client.query(
    `INSERT INTO users (name, email, email_verified, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      user.name ?? null,
      user.email ?? null,
      user.email_verified ?? null,
      user.password ?? null,
    ],
  );
  return r.rows[0];
}

// saves session info in redis
export function loginUserSession(req: Request, user: User) {
  req.session.userId = user.id;
}

// finds a user using the provider name and id given by the provider
export async function findUserByProvider(
  provider: string,
  provider_user_id: string,
): Promise<User | null> {
  const query = `
    SELECT u.*
    FROM auth_providers ap
    JOIN users u ON u.id = ap.user_id
    WHERE ap.provider = $1
      AND ap.provider_user_id = $2
    LIMIT 1;
  `;

  const result = await pool.query(query, [provider, provider_user_id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
}

// link a provider and provider given id to a current user
export async function updateUserAuthProvider(
  user_id: number,
  provider: string,
  provider_user_id: string,
  client: Pool | PoolClient = pool
): Promise<void> {
  const query = `
    INSERT INTO auth_providers (user_id, provider, provider_user_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (provider, provider_user_id)
    DO UPDATE SET user_id = EXCLUDED.user_id;
  `;

  await client.query(query, [user_id, provider, provider_user_id]);
}

// creates user and updates provider inside a transaction to make sure it is atomic compliant
export async function createUserWithProvider(
  user: newUser,
  provider: string,
  provider_user_id: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // create user
    const userCreated = await createUser(user, client);
    // link a provider to the user
    await updateUserAuthProvider(userCreated.id, provider, provider_user_id, client);

    client.query("COMMIT");
    return userCreated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}