import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// scrypt is callback based so with promisify we can await it
const scryptAsync = promisify(scrypt);

const PasswordService = {
  toHash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },

  compare: async (storedPassword: string, suppliedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    // we hash the new sign-in password
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    // compare the new supplied password with the stored hashed password
    return buf.toString("hex") === hashedPassword;
  },
};

export default PasswordService;
