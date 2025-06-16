import bcrypt from "bcrypt";
import { CONFIG } from "../config";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds =
    typeof CONFIG.SALT_ROUNDS === "string"
      ? parseInt(CONFIG.SALT_ROUNDS, 10)
      : CONFIG.SALT_ROUNDS;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
