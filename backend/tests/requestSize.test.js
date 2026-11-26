
import request from "supertest";
import app from "../app.js";

describe("Request Body Size Limit Test", () => {

  test("Should reject requests larger than 100KB", async () => {

    const largePayload = {
      language: "c",
      code: "a".repeat(110000),
      input: "",
    };

    const response = await request(app)
      .post("/api/compiler/run")
      .send(largePayload);

    expect(response.statusCode).toBe(413);

  });

});
