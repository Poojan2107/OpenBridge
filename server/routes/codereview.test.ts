import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server";

describe("POST /api/codereview", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  it("should perform heuristics-based code review for valid snippet (local fallback)", async () => {
    const res = await request(app)
      .post("/api/codereview")
      .send({
        code: "function add(a: number, b: number): number {\n  return a + b;\n}",
        language: "typescript",
        context: "Adding a simple helper function for addition."
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("overall");
    expect(res.body).toHaveProperty("score");
    expect(typeof res.body.score).toBe("number");
    expect(res.body).toHaveProperty("summary");
    expect(res.body).toHaveProperty("praise");
    expect(Array.isArray(res.body.praise)).toBe(true);
    expect(res.body).toHaveProperty("issues");
    expect(Array.isArray(res.body.issues)).toBe(true);
    expect(res.body).toHaveProperty("suggestions");
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it("should flag console.log and TODOs in heuristic mode", async () => {
    const res = await request(app)
      .post("/api/codereview")
      .send({
        code: "function calculate() {\n  // TODO: implement logic\n  console.log('debugging...');\n  return 0;\n}",
        language: "javascript"
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBeLessThan(80); // Should trigger penalties (score: 62 due to hasTodos)
    
    const issuesMessages = res.body.issues.map((i: any) => i.message);
    const hasConsoleIssue = issuesMessages.some((msg: string) => msg.includes("console.log"));
    const hasTodoIssue = issuesMessages.some((msg: string) => msg.includes("TODO/FIXME"));
    
    expect(hasConsoleIssue).toBe(true);
    expect(hasTodoIssue).toBe(true);
  });

  it("should fail validation if code snippet is too short", async () => {
    const res = await request(app)
      .post("/api/codereview")
      .send({
        code: "short"
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("details");
  });
});
