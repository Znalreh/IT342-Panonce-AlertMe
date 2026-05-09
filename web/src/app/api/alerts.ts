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
  files?: File[];
}

interface CreateAlertResponse {
  message: string;
  id: string;
}

export type AlertStatus = "RECEIVED" | "INVESTIGATING" | "RESOLVED";

export interface AlertStatusHistoryEntry {
  id: string;
  fromStatus?: AlertStatus;
  toStatus: AlertStatus;
  comment?: string;
  changedByName: string;
  createdAt: string;
}

export interface AlertMedia {
  id: string;
  mediaType: "PHOTO" | "VIDEO";
  mimeType: string;
  storageKey: string;
  originalFilename: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface AlertData {
  id: string;
  category: string;
  priority: AlertPriority;
  status: AlertStatus;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  reporterEmail?: string;
  mediaAttachments?: AlertMedia[];
  statusHistory?: AlertStatusHistoryEntry[];
}

export async function fetchAlerts(): Promise<AlertData[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl("/api/v1/alerts"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not load alerts.";
    throw new Error(message);
  }

  return responseBody as AlertData[];
}

export async function postAlertComment(alertId: string, comment: string): Promise<AlertStatusHistoryEntry> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl(`/api/v1/alerts/${alertId}/comment`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not post comment.";
    throw new Error(message);
  }

  return responseBody as AlertStatusHistoryEntry;
}

export async function createAlert(payload: CreateAlertPayload): Promise<CreateAlertResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const formData = new FormData();
  formData.append('category', payload.category);
  formData.append('priority', payload.priority);
  formData.append('locationText', payload.locationText);
  if (payload.title) formData.append('title', payload.title);
  if (payload.description) formData.append('description', payload.description);
  if (payload.latitude !== undefined) formData.append('latitude', payload.latitude.toString());
  if (payload.longitude !== undefined) formData.append('longitude', payload.longitude.toString());
  if (payload.geocodedAddress) formData.append('geocodedAddress', payload.geocodedAddress);
  if (payload.files) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await fetch(buildApiUrl("/api/v1/alerts"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not submit alert.";
    throw new Error(message);
  }

  return responseBody as CreateAlertResponse;
}
