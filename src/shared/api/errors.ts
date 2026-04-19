export interface HerodotErrorBody {
  error: {
    code: number;
    status: string;
    reason?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  reason?: string;
  body?: HerodotErrorBody;

  constructor(status: number, message: string, body?: HerodotErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = body?.error?.reason;
    this.body = body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}
