export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const Errors = {
  Unauthorized: () => new ApiError("Unauthorized", 401, "UNAUTHORIZED"),
  Forbidden: () => new ApiError("Forbidden", 403, "FORBIDDEN"),
  NotFound: (resource: string) => new ApiError(`${resource} not found`, 404, "NOT_FOUND"),
  BadInput: (msg: string) => new ApiError(msg, 400, "BAD_INPUT"),
  RateLimited: () => new ApiError("Too many requests", 429, "RATE_LIMITED"),
  Conflict: (msg: string) => new ApiError(msg, 409, "CONFLICT"),
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  console.error("[API Error]", error)
  return Response.json({ error: "Internal server error" }, { status: 500 })
}
