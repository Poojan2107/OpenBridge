import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server";

describe("POST /api/recommend", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  it("should return recommendations for a valid profile (local simulation)", async () => {
    const res = await request(app)
      .post("/api/recommend")
      .send({
        skills: ["React", "TypeScript"],
        level: "Beginner",
        interest: "Frontend"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("repos");
    expect(Array.isArray(res.body.repos)).toBe(true);
    expect(res.body.repos.length).toBe(3);
    
    const firstRepo = res.body.repos[0];
    expect(firstRepo).toHaveProperty("name");
    expect(firstRepo).toHaveProperty("description");
    expect(firstRepo).toHaveProperty("match");
    expect(firstRepo).toHaveProperty("difficulty", "Beginner");
    expect(firstRepo).toHaveProperty("reason");
    expect(firstRepo).toHaveProperty("issues");
    expect(Array.isArray(firstRepo.issues)).toBe(true);
  });

  it("should fail validation with invalid payload", async () => {
    const res = await request(app)
      .post("/api/recommend")
      .send({
        skills: "not-an-array",
        level: 123
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
