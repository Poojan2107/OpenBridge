import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "./encryption";

describe("Token Encryption Service", () => {
  beforeAll(() => {
    // Set a dummy encryption key for test consistency
    process.env.ENCRYPTION_KEY = "test_key_for_openbridge_unit_tests";
  });

  it("should encrypt and decrypt a standard token back to the original value", () => {
    const originalToken = "gho_1234567890abcdefghijklmnopqrstuvwxyz";
    const encrypted = encrypt(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted).toContain(":"); // Should contain IV and ciphertext separated by colon

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it("should return raw text fallback when decrypting a malformed string", () => {
    const malformed = "some_random_unencrypted_text";
    const decrypted = decrypt(malformed);
    expect(decrypted).toBe(malformed);
  });

  it("should output different ciphertexts for the same plaintext due to random IVs", () => {
    const token = "my_secret_token";
    const enc1 = encrypt(token);
    const enc2 = encrypt(token);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(token);
    expect(decrypt(enc2)).toBe(token);
  });
});
