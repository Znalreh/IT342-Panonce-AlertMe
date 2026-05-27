import type { AlertStatus } from "./alerts";

export interface AlertStatusUpdate {
  alertId: string;
  status: AlertStatus | "DELETED";
  alertTitle?: string;
  updatedAt?: string;
  eventType?: string;
}

function getWebSocketUrl(endpoint: string) {
  if (endpoint.startsWith("ws://") || endpoint.startsWith("wss://")) {
    return endpoint;
  }

  const url = new URL(endpoint, window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export function connectToAlertStatusUpdates(onUpdate: (update: AlertStatusUpdate) => void) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  const endpoint = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, "")}/ws/alerts` : "/ws/alerts";
  const ws = new WebSocket(getWebSocketUrl(endpoint));

  ws.addEventListener("open", () => {
    console.debug("Alert status WebSocket connected", endpoint);
  });

  ws.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data) as AlertStatusUpdate;
      if (payload?.alertId && (payload?.status || payload?.eventType === "ALERT_DELETED")) {
        onUpdate(payload);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message", error);
    }
  });

  ws.addEventListener("error", (event) => {
    console.error("Alert status WebSocket error", event);
  });

  return {
    close() {
      ws.close();
    },
  };
}
