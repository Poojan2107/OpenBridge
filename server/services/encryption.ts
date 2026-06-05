import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.ENCRYPTION_KEY) {
  throw new Error("CRITICAL ERROR: ENCRYPTION_KEY environment variable is required in production mode to prevent session data decryption failures!");
}

const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY 
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest() 
  : crypto.randomBytes(32); 

const IV_LENGTH = 16;

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
}

export function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const ivPart = textParts.shift();
    if (!ivPart) return text;
    const iv = Buffer.from(ivPart, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption failed:", err);
    return text;
  }
}
