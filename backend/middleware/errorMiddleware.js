
const errorMiddleware = (err, req, res, next) => {
  console.error("Backend Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  let message;

  if (statusCode >= 500) {
    message = "Internal Server Error";
  } else if (isProduction && statusCode !== 404) {
    message = "Request failed.";
  } else {
    message = err.message || "Something went wrong.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
