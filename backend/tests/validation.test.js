
import request from "supertest";
import app from "../app.js";

describe("Compiler Input Validation", () => {

  // Test 1: Missing Language
  test("Should return 400 when language is missing", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        code: 'printf("Hello");',
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Language and code are required.",
    });
  });

  // Test 2: Missing Code
  test("Should return 400 when code is missing", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "c",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Language and code are required.",
    });
  });

  // Test 3: Unsupported Language
  test("Should reject unsupported programming languages", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "python",
        code: 'print("Hello World")',
        input: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(
      /Unsupported programming language/i
    );
  });

  // Test 4: Invalid Input Type
  test("Should reject non-string input", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "c",
        code: 'int main() { return 0; }',
        input: 12345,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(
      /Program input is too large/i
    );
  });

  // Test 5: Oversized Source Code
  test("Should reject oversized source code", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "c",
        code: "a".repeat(50001),
        input: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(
      /Source code is too large/i
    );
  });

});
