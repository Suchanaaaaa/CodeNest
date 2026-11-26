
import request from "supertest";
import app from "../app.js";

describe("Compiler Rate Limiting Test", () => {

  test("Should block requests after exceeding the rate limit", async () => {

    const requests = [];

    for (let i = 0; i < 21; i++) {
      requests.push(
        request(app)
          .post("/api/compiler/run")
          .send({
            language: "invalid",
            code: "test",
            input: "",
          })
      );
    }

    const responses = await Promise.all(requests);

    const blockedResponse = responses.find(
      (response) => response.statusCode === 429
    );

    expect(blockedResponse).toBeDefined();

    expect(blockedResponse.body).toEqual({
      success: false,
      message: "Too many code execution requests. Please try again later.",
    });

  });

});
