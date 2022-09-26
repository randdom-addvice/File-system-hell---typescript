class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error, res) {
  let statusCode = error?.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: error.message, code: statusCode });
}

export { ErrorResponse, handleError };
