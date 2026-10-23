export function errorHandler(error, _request, response, _next) {
  if (error.type === "entity.too.large") {
    response.status(413).json({ error: "Request body exceeds the 20 KB limit." });
    return;
  }
  if (error.type === "entity.parse.failed") {
    response.status(400).json({ error: "Request body must contain valid JSON." });
    return;
  }
  if (error.code === 11000) {
    response.status(409).json({ error: "A record with that unique value already exists." });
    return;
  }
  if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error.name === "CastError") {
    response.status(400).json({ error: "The requested record ID is invalid." });
    return;
  }

  if (!error.status || error.status >= 500) {
    console.error(error);
  }
  response.status(error.status || 500).json({
    error: error.status && error.status < 500 ? error.message : "An unexpected server error occurred.",
  });
}
