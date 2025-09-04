/**
 * Base EAMP Client Error
 */
export class EAMPClientError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'EAMP_ERROR', field?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'EAMPClientError';
    this.code = code;
    this.field = field;
    this.details = details;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EAMPClientError);
    }
  }
}

/**
 * Resource Not Found Error
 */
export class ResourceNotFoundError extends EAMPClientError {
  constructor(message: string) {
    super(message, 'RESOURCE_NOT_FOUND');
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends EAMPClientError {
  constructor(message: string, field?: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', field, details);
    this.name = 'ValidationError';
  }
}

/**
 * Network Error
 */
export class NetworkError extends EAMPClientError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends EAMPClientError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends EAMPClientError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends EAMPClientError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Server Error
 */
export class ServerError extends EAMPClientError {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message, 'SERVER_ERROR');
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends EAMPClientError {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}