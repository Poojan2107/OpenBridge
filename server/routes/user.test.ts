import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server";

describe("POST /api/gpg/verify", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  // Helper to build a valid PGP block
  const getValidArmoredKey = () => {
    const tag6Body = Buffer.alloc(10);
    tag6Body[0] = 4;
    tag6Body.writeUInt32BE(1600000000, 1);
    tag6Body[5] = 1; // RSA
    tag6Body.writeUInt16BE(2048, 6);
    const tag6Header = Buffer.from([0x98, tag6Body.length]);
    const tag6Packet = Buffer.concat([tag6Header, tag6Body]);

    const tag13Body = Buffer.from("User Name <user@example.com>", "utf8");
    const tag13Header = Buffer.from([0xb4, tag13Body.length]);
    const tag13Packet = Buffer.concat([tag13Header, tag13Body]);

    const base64Key = Buffer.concat([tag6Packet, tag13Packet]).toString("base64");
    return [
      "-----BEGIN PGP PUBLIC KEY BLOCK-----",
      "",
      base64Key,
      "-----END PGP PUBLIC KEY BLOCK-----"
    ].join("\n");
  };

  it("should verify a valid PGP public key block and return metadata", async () => {
    const key = getValidArmoredKey();
    const res = await request(app)
      .post("/api/gpg/verify")
      .send({ publicKeyBlock: key });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("metadata");
    expect(res.body.metadata.name).toBe("User Name");
    expect(res.body.metadata.email).toBe("user@example.com");
    expect(res.body.metadata.algorithm).toBe("RSA");
  });

  it("should fail to verify an invalid PGP block", async () => {
    const res = await request(app)
      .post("/api/gpg/verify")
      .send({ publicKeyBlock: "invalid block content" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail validation for empty payload", async () => {
    const res = await request(app)
      .post("/api/gpg/verify")
      .send({ publicKeyBlock: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("details");
  });
});
