
import errorMiddleware from "../middleware/errorMiddleware.js";
import { jest } from "@jest/globals";

describe("Global Error Middleware Test", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  test("Should return 500 for unexpected server errors", () => {
    const error = new Error("Database connection failed");

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  test("Should return custom status code for known errors", () => {
    const error = new Error("Resource not found");
    error.statusCode = 404;

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found",
    });
  });

  test("Should hide internal error details in production", () => {
    process.env.NODE_ENV = "production";

    const error = new Error("Database password exposed");
    error.statusCode = 500;

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  test("Should hide internal 400 error details in production", () => {
    process.env.NODE_ENV = "production";

    const error = new Error("Sensitive validation details");
    error.statusCode = 400;

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Request failed.",
    });
  });
});
