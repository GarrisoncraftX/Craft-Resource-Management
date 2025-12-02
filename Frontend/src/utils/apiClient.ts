/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://192.168.1.101:5003`;

export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('craft_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response) {
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
    
    return response.json();
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any) {
    const headers = this.getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any, options?: { headers?: HeadersInit }) {
    const headers = options?.headers ? { ...this.getHeaders(), ...options.headers } : this.getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body,
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
