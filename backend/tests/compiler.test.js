import request from "supertest";
import app from "../app.js";

describe("Compiler Route Test", () => {
  test("GET /api/compiler/test should return success message", async () => {
    const response = await request(app).get("/api/compiler/test");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "CodeNest Compiler Route is working!",
    });
  });
});