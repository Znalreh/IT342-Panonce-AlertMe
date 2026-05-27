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
  title?: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  geocodedAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  reporterEmail?: string;
  assignedToName?: string;
  assignedToEmail?: string;
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

export interface AdminStats {
  totalAlerts: number;
  receivedAlerts: number;
  investigatingAlerts: number;
  resolvedAlerts: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl("/api/v1/alerts/admin/stats"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not load admin stats.";
    throw new Error(message);
  }

  return responseBody as AdminStats;
}

export interface AdminAlertsFilters {
  status?: AlertStatus;
  category?: string;
  priority?: AlertPriority;
  search?: string;
}

export async function fetchAlertsForAdmin(filters?: AdminAlertsFilters): Promise<AlertData[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);

  const url = params.toString() ? `${buildApiUrl("/api/v1/alerts/admin")}?${params}` : buildApiUrl("/api/v1/alerts/admin");

  const response = await fetch(url, {
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

export async function updateAlertStatus(alertId: string, status: AlertStatus, comment?: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const payload: any = { status };
  if (comment) payload.comment = comment;

  const response = await fetch(buildApiUrl(`/api/v1/alerts/${alertId}/status`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not update alert status.";
    throw new Error(message);
  }
}

export async function assignAlert(alertId: string, assignedToUserId?: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const payload: any = {};
  if (assignedToUserId) payload.assignedToUserId = assignedToUserId;

  const response = await fetch(buildApiUrl(`/api/v1/alerts/${alertId}/assign`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not assign alert.";
    throw new Error(message);
  }
}

export async function deleteAlert(alertId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl(`/api/v1/alerts/${alertId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseBody?.message ?? "Could not delete alert.";
    throw new Error(message);
  }
}
