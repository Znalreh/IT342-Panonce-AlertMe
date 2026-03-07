const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type Role = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";
const TOKEN_STORAGE_KEY = "alertme_access_token";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  accessToken: string;
  tokenType: string;
  expiresAt: number;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function parseResponse(response: Response): Promise<AuthUser> {
  if (response.ok) {
    return (await response.json()) as AuthUser;
  }

  let message = "Request failed.";
  try {
    const errorPayload = (await response.json()) as { message?: string };
    if (errorPayload.message) {
      message = errorPayload.message;
    }
  } catch {
    // Keep default message when backend response is not JSON.
  }

  throw new Error(message);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE_URL}/oauth2/authorization/google`;
}
