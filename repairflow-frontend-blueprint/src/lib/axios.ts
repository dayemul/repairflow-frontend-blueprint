// FixFlow HTTP API Client & Interceptor Specification
// Ready for teammate backend connection at VITE_API_URL (e.g. http://localhost:5000/api)
import { env } from '@/config/env';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export const api = {
  baseURL: env.VITE_API_URL,

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(
      endpoint.startsWith('http') ? endpoint : `${window.location.origin}${this.baseURL}${endpoint}`
    );

    if (options.params) {
      Object.entries(options.params).forEach(([k, v]) => {
        url.searchParams.append(k, String(v));
      });
    }

    const token = localStorage.getItem('fixflow_jwt_token_sample');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle 401 unauthorized / refresh token flow
        console.warn('Unauthorized request - redirecting or refreshing token');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
