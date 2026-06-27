import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../server";
import { prisma } from "../../src/db";

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
      "-----END PGP PUBLIC KEY BLOCK-----",
    ].join("\n");
  };

  it("should verify a valid PGP public key block and return metadata", async () => {
    const key = getValidArmoredKey();
    const res = await request(app).post("/api/gpg/verify").send({ publicKeyBlock: key });

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
    const res = await request(app).post("/api/gpg/verify").send({ publicKeyBlock: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("details");
  });
});

describe("POST /api/pr/register", () => {
  const testLogin = "pr-register-test-user";
  let testUserId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";

    // Seed user
    const user = await prisma.user.upsert({
      where: { githubId: "test-pr-register-id" },
      update: {},
      create: {
        githubId: "test-pr-register-id",
        githubLogin: testLogin,
        email: "pr-register-test@example.com",
        avatarUrl: "https://example.com/avatar.png",
        accessToken: "test-token",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.pullRequest.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it("should successfully register a valid pull request URL", async () => {
    const res = await request(app).post("/api/pr/register").send({
      githubLogin: testLogin,
      prUrl: "https://github.com/Poojan2107/OpenBridge/pull/202",
      title: "feat: add registration tests",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.pullRequest).toHaveProperty("prNumber", 202);
    expect(res.body.pullRequest).toHaveProperty("repoFullName", "Poojan2107/OpenBridge");
    expect(res.body.pullRequest).toHaveProperty("status", "PENDING");
  });

  it("should fail validation for invalid PR URL format", async () => {
    const res = await request(app).post("/api/pr/register").send({
      githubLogin: testLogin,
      prUrl: "invalid-url",
      title: "test",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 404 if user is not found", async () => {
    const res = await request(app).post("/api/pr/register").send({
      githubLogin: "nonexistent-user-12345",
      prUrl: "https://github.com/Poojan2107/OpenBridge/pull/202",
      title: "test",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found.");
  });
});
