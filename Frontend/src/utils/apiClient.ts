/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://localhost:5003`;
const API_FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL ?? `http://localhost:5003`;

export class ApiClient {
  private readonly baseURL: string;
  private readonly fallbackURL: string;

  constructor(baseURL: string, fallbackURL?: string) {
    this.baseURL = baseURL;
    this.fallbackURL = fallbackURL ?? 'http://localhost:5003';
  }

  private isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }

  private async fetchWithFallback(url: string, options: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
      return response;
    } catch (error) {
      if (this.isNetworkError(error) || (error as Error).name === 'TimeoutError') {
        const fallbackUrl = url.startsWith(this.baseURL) 
          ? url.replace(this.baseURL, this.fallbackURL)
          : url.replace(this.fallbackURL, this.baseURL);
        return await fetch(fallbackUrl, options);
      }
      throw error;
    }
  }

  private getHeaders(skipAuth = false): HeadersInit {
    const token = localStorage.getItem('craft_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token && !skipAuth) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'An error occurred. Please try again.';
      
      try {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = response.statusText || errorMessage;
      }
      
      if (response.status === 401 && !globalThis.location.pathname.includes('/signin')) {
        localStorage.removeItem('craft_token');
        localStorage.removeItem('craft_user');
        globalThis.location.href = '/signin';
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    return response.json();
  }

  async get(endpoint: string, options?: { responseType?: 'json' | 'blob' }) {
    const response = await this.fetchWithFallback(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (options?.responseType === 'blob') {
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message ?? errorData.error ?? errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        if (response.status === 401) {
          localStorage.removeItem('craft_token');
          localStorage.removeItem('craft_user');
          globalThis.location.href = '/signin';
        }

        throw new Error(errorMessage);
      }

      return response.blob();
    }

    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, options?: { skipAuth?: boolean }) {
    const headers = this.getHeaders(options?.skipAuth);
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await this.fetchWithFallback(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }

  async put(endpoint: string, data: any, options?: { headers?: HeadersInit }) {
    const headers = options?.headers ? { ...this.getHeaders(), ...options.headers } : this.getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await this.fetchWithFallback(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body,
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await this.fetchWithFallback(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async patch(endpoint: string, data?: any) {
    const response = await this.fetchWithFallback(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_FALLBACK_URL);
