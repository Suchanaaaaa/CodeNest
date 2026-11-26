import request from "supertest";
import app from "../app.js";

describe("Health API Test", () => {
  test("GET /api/health should return backend status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      status: "Backend is running",
      project: "CodeNest",
    });
  });
});