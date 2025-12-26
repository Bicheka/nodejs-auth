import { pool } from "../config";

export async function setEmailVerified(id: string) {
  pool.query(
    `UPDATE users
    SET email_verified = true,
    WHERE id = $1
    `,
    [id],
  );
}

export function generateConfirmationCode() {
  // generate random 6 digit code
  let length = 6;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
