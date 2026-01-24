const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // ignore body parsing errors for empty responses
  }

  if (!response.ok) {
    const message =
      (payload as { detail?: string; message?: string } | null)?.detail ??
      (payload as { detail?: string; message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return payload as T;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  preferred_language?: string;
  learning_style?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name?: string | null;
  preferred_language?: string | null;
  learning_style?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function registerUser(payload: RegisterPayload) {
  return request<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      preferred_language: payload.preferred_language ?? "en",
      learning_style: payload.learning_style ?? "not_set",
    }),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
