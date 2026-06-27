import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import { app } from "../../server";
import { prisma } from "../../src/db";

describe("POST /api/webhooks/github", () => {
  const testLogin = "webhook-test-user-temp";
  let testUserId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";

    // Seed a test user for database lookups during webhook tests
    const user = await prisma.user.upsert({
      where: { githubId: "test-webhook-id" },
      update: {},
      create: {
        githubId: "test-webhook-id",
        githubLogin: testLogin,
        email: "webhook-test@example.com",
        avatarUrl: "https://example.com/avatar.png",
        accessToken: "test-token",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pullRequest.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  // Helper to sign payloads
  const signPayload = (payload: string, secret: string) => {
    const hmac = crypto.createHmac("sha256", secret);
    return "sha256=" + hmac.update(payload).digest("hex");
  };

  it("should process pull_request opened event and insert PR into database", async () => {
    const payload = {
      action: "opened",
      pull_request: {
        number: 101,
        title: "feat: add webhook support",
        state: "open",
        merged: false,
        html_url: "https://github.com/Poojan2107/OpenBridge/pull/101",
        user: { login: testLogin },
      },
      repository: {
        full_name: "Poojan2107/OpenBridge",
      },
    };

    const payloadStr = JSON.stringify(payload);

    const res = await request(app)
      .post("/api/webhooks/github")
      .set("x-github-event", "pull_request")
      .set("Content-Type", "application/json")
      .send(payloadStr);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.pullRequest).toHaveProperty("status", "PENDING");
    expect(res.body.pullRequest).toHaveProperty("prNumber", 101);

    // Verify it exists in Prisma
    const dbPr = await prisma.pullRequest.findFirst({
      where: { userId: testUserId, prNumber: 101 },
    });
    expect(dbPr).not.toBeNull();
    expect(dbPr?.status).toBe("PENDING");
  });

  it("should update PR status to MERGED when closed and merged: true", async () => {
    // 1. Create initial PR
    await prisma.pullRequest.create({
      data: {
        userId: testUserId,
        prNumber: 102,
        repoFullName: "Poojan2107/OpenBridge",
        title: "feat: align grid styles",
        url: "https://github.com/Poojan2107/OpenBridge/pull/102",
        status: "PENDING",
      },
    });

    const payload = {
      action: "closed",
      pull_request: {
        number: 102,
        title: "feat: align grid styles",
        state: "closed",
        merged: true,
        html_url: "https://github.com/Poojan2107/OpenBridge/pull/102",
        user: { login: testLogin },
      },
      repository: {
        full_name: "Poojan2107/OpenBridge",
      },
    };

    const res = await request(app)
      .post("/api/webhooks/github")
      .set("x-github-event", "pull_request")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.pullRequest).toHaveProperty("status", "MERGED");

    const dbPr = await prisma.pullRequest.findFirst({
      where: { userId: testUserId, prNumber: 102 },
    });
    expect(dbPr?.status).toBe("MERGED");
  });

  it("should ignore non-pull_request events", async () => {
    const res = await request(app)
      .post("/api/webhooks/github")
      .set("x-github-event", "issue_comment")
      .send({ action: "created" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ignored");
  });

  it("should block request if webhook secret signature is invalid", async () => {
    const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
    process.env.GITHUB_WEBHOOK_SECRET = "supersecretkey";

    const payload = { action: "opened" };
    const payloadStr = JSON.stringify(payload);

    const res = await request(app)
      .post("/api/webhooks/github")
      .set("x-github-event", "pull_request")
      .set("x-hub-signature-256", "sha256=invalid-signature")
      .set("Content-Type", "application/json")
      .send(payloadStr);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");

    // Restore environment variable
    if (originalSecret) {
      process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    } else {
      delete process.env.GITHUB_WEBHOOK_SECRET;
    }
  });

  it("should pass signature check if secret is correct", async () => {
    const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
    process.env.GITHUB_WEBHOOK_SECRET = "supersecretkey";

    const payload = {
      action: "opened",
      pull_request: {
        number: 103,
        title: "feat: signed check",
        state: "open",
        merged: false,
        html_url: "https://github.com/Poojan2107/OpenBridge/pull/103",
        user: { login: testLogin },
      },
      repository: {
        full_name: "Poojan2107/OpenBridge",
      },
    };
    const payloadStr = JSON.stringify(payload);
    const signature = signPayload(payloadStr, "supersecretkey");

    const res = await request(app)
      .post("/api/webhooks/github")
      .set("x-github-event", "pull_request")
      .set("x-hub-signature-256", signature)
      .set("Content-Type", "application/json")
      .send(payloadStr);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);

    // Restore environment variable
    if (originalSecret) {
      process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    } else {
      delete process.env.GITHUB_WEBHOOK_SECRET;
    }
  });
});
