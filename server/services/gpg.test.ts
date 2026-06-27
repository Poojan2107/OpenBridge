import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { parseGpgPublicKey } from "./gpg";

describe("parseGpgPublicKey", () => {
  it("should successfully parse a programmatically constructed valid OpenPGP public key block", () => {
    // 1. Construct Tag 6 Packet (Public Key)
    // Packet body: version (1 byte), creation time (4 bytes), algorithm ID (1 byte), MPI bit length (2 bytes)
    const tag6Body = Buffer.alloc(10);
    tag6Body[0] = 4; // Version 4
    tag6Body.writeUInt32BE(1600000000, 1); // Created at timestamp
    tag6Body[5] = 1; // Algorithm: RSA
    tag6Body.writeUInt16BE(2048, 6); // RSA bit length (2048)

    // Tag 6 Header (old format, lenType = 0)
    // headerByte = 0x80 | (6 << 2) | 0 = 0x98
    const tag6Header = Buffer.from([0x98, tag6Body.length]);
    const tag6Packet = Buffer.concat([tag6Header, tag6Body]);

    // 2. Construct Tag 13 Packet (User ID)
    const userIdString = "Alice Developer <alice@example.com>";
    const tag13Body = Buffer.from(userIdString, "utf8");

    // Tag 13 Header (old format, lenType = 0)
    // headerByte = 0x80 | (13 << 2) | 0 = 0xb4
    const tag13Header = Buffer.from([0xb4, tag13Body.length]);
    const tag13Packet = Buffer.concat([tag13Header, tag13Body]);

    // Concatenate all packets
    const binaryKey = Buffer.concat([tag6Packet, tag13Packet]);
    const base64Key = binaryKey.toString("base64");

    // Wrap in ASCII armor
    const armoredKey = [
      "-----BEGIN PGP PUBLIC KEY BLOCK-----",
      "Version: OpenBridge Test Generator",
      "",
      base64Key,
      "-----END PGP PUBLIC KEY BLOCK-----",
    ].join("\n");

    // Compute expected GPG Key ID (low-order 8 bytes of SHA-1 fingerprint)
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16BE(tag6Body.length);
    const hash = crypto.createHash("sha1");
    hash.update(Buffer.from([0x99]));
    hash.update(lenBuf);
    hash.update(tag6Body);
    const fingerprint = hash.digest();
    const expectedKeyId = fingerprint.subarray(12, 20).toString("hex").toUpperCase();

    // Parse the armored key block
    const result = parseGpgPublicKey(armoredKey);

    expect(result.name).toBe("Alice Developer");
    expect(result.email).toBe("alice@example.com");
    expect(result.keyId).toBe(expectedKeyId);
    expect(result.algorithm).toBe("RSA");
    expect(result.keyLength).toBe(2048);
    expect(result.createdAt.getTime()).toBe(1600000000 * 1000);
  });

  it("should throw error if PGP boundaries are missing", () => {
    expect(() => {
      parseGpgPublicKey("not a valid key block");
    }).toThrow("Invalid GPG key block: missing PGP public key block boundaries.");
  });

  it("should throw error if no public key packet tag 6 is present", () => {
    // Construct only Tag 13 packet (User ID)
    const userIdString = "Bob <bob@example.com>";
    const tag13Body = Buffer.from(userIdString, "utf8");
    const tag13Header = Buffer.from([0xb4, tag13Body.length]);
    const binaryKey = Buffer.concat([tag13Header, tag13Body]);
    const base64Key = binaryKey.toString("base64");

    const armoredKey = [
      "-----BEGIN PGP PUBLIC KEY BLOCK-----",
      "",
      base64Key,
      "-----END PGP PUBLIC KEY BLOCK-----",
    ].join("\n");

    expect(() => {
      parseGpgPublicKey(armoredKey);
    }).toThrow("Invalid GPG key block: no public key packet (tag 6) found.");
  });
});
