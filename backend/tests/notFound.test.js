
import request from "supertest";
import app from "../app.js";

describe("404 Not Found Test", () => {
  test("Should return JSON error for unknown routes", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Route not found: /api/unknown-route",
    });
  });
});

