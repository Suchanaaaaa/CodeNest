
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

});
