const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

function buildApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

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

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt?: string;
  lastLoginAt?: string;
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
  const response = await fetch(buildApiUrl("/api/v1/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(buildApiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getCurrentUser(): Promise<UserProfile> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl("/api/v1/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (response.ok) {
    return (await response.json()) as UserProfile;
  }

  let message = "Could not load profile.";
  try {
    const errorPayload = (await response.json()) as { message?: string };
    if (errorPayload.message) {
      message = errorPayload.message;
    }
  } catch {
    // keep default error message
  }

  throw new Error(message);
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
  return buildApiUrl("/oauth2/authorization/google");
}

export function processOAuthCallback(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");

  if (!accessToken) {
    return false;
  }

  saveAuthToken(accessToken);

  const { pathname, hash } = window.location;
  const cleanUrl = `${pathname}${hash}`;

  if (window.location.search) {
    window.location.replace(cleanUrl);
  }

  return true;
}

export async function getDashboardRoute(): Promise<string> {
  try {
    const user = await getCurrentUser();
    return user.role === "STUDENT" ? "/dashboard" : "/admin";
  } catch (error) {
    // If we can't get user info, default to student dashboard
    return "/dashboard";
  }
}
