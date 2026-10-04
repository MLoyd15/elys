export function errorHandler(error, _request, response, _next) {
  console.error(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;
  response.status(status).json({
    error: error.expose === true
      ? error.message
      : status === 413
        ? "This text is too large for a single request. Try a shorter passage."
        : "Something went wrong. Please try again.",
  });
}
