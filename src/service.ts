import { pool } from "./config";
import type { Request } from "express";

type newUser = {
  name: string;
  email: string;
  email_verified: boolean;
  password: string | undefined;
};

type User = {
    id: number,
    name: string,
    email: string,
    email_verified: boolean,
    password: string | undefined,
}

export async function findUserByEmail(email: string) {
  const r = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return r.rows[0];
}

export async function findUserById(id: number) {
  const r = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return r.rows[0];
}

export async function createUser(user: newUser): Promise<User> {
  const r = await pool.query(
    `INSERT INTO users (name, email, email_verified, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      user.name ?? null,
      user.email ?? null,
      user.email_verified ?? null,
      user.password ?? null
    ]
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
  provider_user_id: string
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
  provider_user_id: string
): Promise<void> {
  const query = `
    INSERT INTO auth_providers (user_id, provider, provider_user_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (provider, provider_user_id)
    DO UPDATE SET user_id = EXCLUDED.user_id;
  `;

  await pool.query(query, [user_id, provider, provider_user_id]);
}