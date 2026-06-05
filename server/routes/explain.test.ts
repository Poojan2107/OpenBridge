import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import { app } from "../../server";

describe("POST /api/explain", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  it("should explain raw technical issue text (simulated/local fallback)", async () => {
    const res = await request(app)
      .post("/api/explain")
      .send({
        issue: "git commit fails due to missing author identity settings"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("meaning");
    expect(res.body).toHaveProperty("files");
    expect(Array.isArray(res.body.files)).toBe(true);
    expect(res.body).toHaveProperty("steps");
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.files.length).toBeGreaterThan(0);
    expect(res.body.steps.length).toBeGreaterThan(0);
  });

  it("should fetch a GitHub issue URL and return an explanation containing live data", async () => {
    // Mock the global fetch to simulate GitHub API response
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        title: "Fix responsive container padding",
        body: "The main page container overlaps on narrow viewports because of missing responsive padding utilities."
      })
    });
    vi.stubGlobal("fetch", mockFetch);

    const res = await request(app)
      .post("/api/explain")
      .send({
        issue: "https://github.com/Poojan2107/OpenBridge/issues/42"
      });

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
    expect(res.body).toHaveProperty("meaning");
    // Under local fallback, meaning should prefix the fetched issue title
    expect(res.body.meaning).toContain("Fix responsive container padding");
    expect(res.body).toHaveProperty("files");
    expect(res.body).toHaveProperty("steps");

    vi.unstubAllGlobals();
  });

  it("should fail validation if issue is empty or missing", async () => {
    const res = await request(app)
      .post("/api/explain")
      .send({
        issue: ""
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("details");
  });
});
