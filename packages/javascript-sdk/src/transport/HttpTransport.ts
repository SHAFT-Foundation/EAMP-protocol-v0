import EventEmitter from 'eventemitter3';
import { ClientOptions } from '../types/metadata.js';
import { NetworkError, EAMPClientError } from '../utils/errors.js';

/**
 * HTTP Transport for EAMP client
 */
export class HttpTransport extends EventEmitter {
  private options: Required<ClientOptions>;
  private abortController?: AbortController;

  constructor(options: Required<ClientOptions>) {
    super();
    this.options = options;
  }

  /**
   * Perform GET request
   */
  async get(path: string): Promise<Response> {
    return this.request('GET', path);
  }

  /**
   * Perform POST request
   */
  async post(path: string, body?: unknown): Promise<Response> {
    return this.request('POST', path, body);
  }

  /**
   * Perform PUT request
   */
  async put(path: string, body?: unknown): Promise<Response> {
    return this.request('PUT', path, body);
  }

  /**
   * Perform DELETE request
   */
  async delete(path: string): Promise<Response> {
    return this.request('DELETE', path);
  }

  /**
   * Generic request method with retry logic
   */
  private async request(method: string, path: string, body?: unknown): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      try {
        return await this.makeRequest(method, path, body);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof EAMPClientError && 
            (error.code === 'RESOURCE_NOT_FOUND' || error.code === 'VALIDATION_ERROR')) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === this.options.retryAttempts) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Make a single HTTP request
   */
  private async makeRequest(method: string, path: string, body?: unknown): Promise<Response> {
    if (!this.options.baseURL) {
      throw new EAMPClientError('Base URL is required for HTTP transport');
    }

    this.abortController = new AbortController();

    const url = new URL(path, this.options.baseURL).toString();
    const headers: Record<string, string> = {
      'Accept': 'application/eamp+json, application/json',
      'Content-Type': 'application/json',
      ...this.options.headers,
    };

    if (this.options.userAgent) {
      headers['User-Agent'] = this.options.userAgent;
    }

    const requestInit: RequestInit = {
      method,
      headers,
      signal: this.abortController.signal,
    };

    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const timeoutId = setTimeout(() => {
        this.abortController?.abort();
      }, this.options.timeout);

      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      return response;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${this.options.timeout}ms`);
      }
      
      if (error instanceof TypeError) {
        throw new NetworkError(`Network error: ${error.message}`);
      }
      
      throw new NetworkError(`Request failed: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel any ongoing requests
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}