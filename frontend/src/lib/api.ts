const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function handleResponse(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || response.statusText || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/${endpoint}`, options);
  return handleResponse(response);
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: any) =>
    request(endpoint, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }),
  patch: (endpoint: string, body: any) =>
    request(endpoint, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }),
};
