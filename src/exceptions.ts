import { ERROR_CODE_RATE_LIMIT_EXCEEDED, ERROR_CODE_USER_NOT_FOUND } from "./constants";

export class AuthError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = ERROR_CODE_USER_NOT_FOUND;
  }
}

export class RateLimitError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = ERROR_CODE_RATE_LIMIT_EXCEEDED;
  }
}
