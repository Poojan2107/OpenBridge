import crypto from "crypto";

export interface GpgKeyMetadata {
  name: string;
  email: string;
  keyId: string;
  algorithm: string;
  keyLength: number;
  createdAt: Date;
}

/**
 * Decodes and parses an ASCII-armored OpenPGP public key block.
 * Extracts the User ID name, email, Key ID, algorithm type, bit length, and creation date.
 */
export function parseGpgPublicKey(armoredKey: string): GpgKeyMetadata {
  const lines = armoredKey.split(/\r?\n/);
  let inBlock = false;
  const base64Lines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----")) {
      inBlock = true;
      continue;
    }
    if (trimmed.startsWith("-----END PGP PUBLIC KEY BLOCK-----")) {
      inBlock = false;
      break;
    }
    if (inBlock) {
      // Skip empty lines or headers
      if (!trimmed || trimmed.includes(":")) {
        continue;
      }
      // Checksum starts with =
      if (trimmed.startsWith("=")) {
        continue;
      }
      base64Lines.push(trimmed);
    }
  }

  if (base64Lines.length === 0) {
    throw new Error("Invalid GPG key block: missing PGP public key block boundaries.");
  }

  let binaryData: Buffer;
  try {
    binaryData = Buffer.from(base64Lines.join(""), "base64");
  } catch (err) {
    throw new Error("Failed to decode base64 binary block from public key.");
  }

  let offset = 0;
  let name = "Unknown";
  let email = "unknown@example.com";
  let keyId = "0000000000000000";
  let algorithm = "RSA";
  let keyLength = 2048;
  let createdAt = new Date();
  let foundPublicKey = false;

  while (offset < binaryData.length) {
    const headerByte = binaryData[offset];
    // OpenPGP packet headers must have bit 7 set to 1
    if ((headerByte & 0x80) === 0) {
      break;
    }

    const isNewFormat = (headerByte & 0x40) !== 0;
    let tag = 0;
    let headerLen = 1;
    let bodyLen = 0;

    if (isNewFormat) {
      tag = headerByte & 0x3f;
      if (offset + 1 >= binaryData.length) break;
      const l1 = binaryData[offset + 1];
      if (l1 < 192) {
        bodyLen = l1;
        headerLen += 1;
      } else if (l1 >= 192 && l1 < 224) {
        if (offset + 2 >= binaryData.length) break;
        const l2 = binaryData[offset + 2];
        bodyLen = ((l1 - 192) << 8) + l2 + 192;
        headerLen += 2;
      } else if (l1 === 255) {
        if (offset + 5 >= binaryData.length) break;
        bodyLen = binaryData.readUInt32BE(offset + 2);
        headerLen += 5;
      } else {
        // Partial body length: consume rest of stream
        bodyLen = binaryData.length - (offset + headerLen);
        headerLen += 1;
      }
    } else {
      tag = (headerByte & 0x3c) >> 2;
      const lenType = headerByte & 0x03;
      if (lenType === 0) {
        if (offset + 1 >= binaryData.length) break;
        bodyLen = binaryData[offset + 1];
        headerLen += 1;
      } else if (lenType === 1) {
        if (offset + 2 >= binaryData.length) break;
        bodyLen = binaryData.readUInt16BE(offset + 1);
        headerLen += 2;
      } else if (lenType === 2) {
        if (offset + 5 >= binaryData.length) break;
        bodyLen = binaryData.readUInt32BE(offset + 1);
        headerLen += 5;
      } else {
        bodyLen = binaryData.length - (offset + headerLen);
      }
    }

    const bodyOffset = offset + headerLen;
    if (bodyOffset + bodyLen > binaryData.length) {
      break;
    }

    const packetBody = binaryData.subarray(bodyOffset, bodyOffset + bodyLen);

    if (tag === 6) {
      // Public Key Packet
      const version = packetBody[0];
      if (version === 4 && packetBody.length >= 6) {
        foundPublicKey = true;
        const timeSec = packetBody.readUInt32BE(1);
        createdAt = new Date(timeSec * 1000);
        
        const algId = packetBody[5];
        if (algId === 1 || algId === 2 || algId === 3) {
          algorithm = "RSA";
          if (packetBody.length >= 8) {
            const bitLen = packetBody.readUInt16BE(6);
            keyLength = bitLen;
          }
        } else if (algId === 17) {
          algorithm = "DSA";
        } else if (algId === 18) {
          algorithm = "ECDH";
        } else if (algId === 19) {
          algorithm = "ECDSA";
        } else if (algId === 22) {
          algorithm = "EdDSA";
        }

        // Calculate SHA-1 Fingerprint
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16BE(packetBody.length);
        const hash = crypto.createHash("sha1");
        hash.update(Buffer.from([0x99]));
        hash.update(lenBuf);
        hash.update(packetBody);
        const fingerprint = hash.digest();
        // GPG Key ID is the low-order 8 bytes (64 bits) of fingerprint
        keyId = fingerprint.subarray(12, 20).toString("hex").toUpperCase();
      }
    } else if (tag === 13) {
      // User ID Packet
      const userIdStr = packetBody.toString("utf8");
      const match = userIdStr.match(/^([^<]+)(?:<([^>]+)>)?/);
      if (match) {
        name = match[1].trim();
        email = match[2] ? match[2].trim() : "unknown@example.com";
      }
    }

    offset += headerLen + bodyLen;
  }

  if (!foundPublicKey) {
    throw new Error("Invalid GPG key block: no public key packet (tag 6) found.");
  }

  return {
    name,
    email,
    keyId,
    algorithm,
    keyLength,
    createdAt
  };
}
