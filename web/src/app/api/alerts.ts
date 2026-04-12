import { getAuthToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

function buildApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

export type AlertPriority = "HIGH" | "MEDIUM" | "LOW";

export interface CreateAlertPayload {
  category: string;
  priority: AlertPriority;
  title: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
}

interface CreateAlertResponse {
  message: string;
  id: string;
}

export async function createAlert(payload: CreateAlertPayload): Promise<CreateAlertResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl("/api/v1/alerts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not submit alert.";
    throw new Error(message);
  }

  return responseBody as CreateAlertResponse;
}
