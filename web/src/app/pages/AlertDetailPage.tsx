import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { fetchAlerts, postAlertComment } from "../api/alerts";
import type { AlertData, AlertStatus, AlertMedia } from "../api/alerts";
import { connectToAlertStatusUpdates } from "../api/websocket";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Share2,
  Flag,
  DollarSign,
  X,
} from "lucide-react";

const statusHistoryTemplate = (status: string, createdAt?: string, updatedAt?: string) => [
  {
    status: "RECEIVED",
    time: createdAt ? formatAlertTime(createdAt) : "Unknown",
    note: "Alert was submitted and queued for review.",
  },
  {
    status,
    time: updatedAt ? formatAlertTime(updatedAt) : "Pending update",
    note: "Team is currently addressing the reported issue.",
  },
];

function formatAlertTime(timestamp?: string) {
  if (!timestamp) {
    return "Unknown time";
  }

  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStatusLabel(status: AlertStatus) {
  switch (status) {
    case "RECEIVED":
      return "Received";
    case "INVESTIGATING":
      return "Investigating";
    case "RESOLVED":
      return "Resolved";
    default:
      return status;
  }
}

function statusBadgeClass(status: AlertStatus) {
  switch (status) {
    case "RECEIVED":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "INVESTIGATING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "RESOLVED":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function formatCommentTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SUPABASE_PUBLIC_ALERTS_URL =
  "https://rjnshudkyinfhwyrxbmh.supabase.co/storage/v1/object/public/alerts";

function getMediaUrl(media: AlertMedia) {
  if (media.storageKey.startsWith("local/")) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
    return `${apiBaseUrl}/api/v1/media/${media.id}`;
  }

  return `${SUPABASE_PUBLIC_ALERTS_URL}/${media.storageKey}`;
}

interface MediaThumbnailProps {
  media: AlertMedia;
  hasError: boolean;
  onError: () => void;
  onClick: () => void;
}

function MediaThumbnail({ media, hasError, onError, onClick }: MediaThumbnailProps) {
  return (
    <div
      className="aspect-video bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden hover:shadow-lg"
      title={media.originalFilename}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      {hasError || media.mediaType !== "PHOTO" ? (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="text-xs">{media.mediaType === "VIDEO" ? "Video" : "Unavailable"}</span>
        </div>
      ) : (
        <img
          src={getMediaUrl(media)}
          alt={media.originalFilename}
          className="w-full h-full object-cover"
          onError={onError}
        />
      )}
    </div>
  );
}

export function AlertDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [mediaLoadErrors, setMediaLoadErrors] = useState<Set<string>>(new Set());
  const [selectedMedia, setSelectedMedia] = useState<AlertMedia | null>(null);
  const loadAlertRef = useRef<(showLoading?: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    loadAlertRef.current = async (showLoading = false) => {
      if (!id) {
        setErrorMessage("Alert ID is missing from the URL.");
        return;
      }

      if (showLoading) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const alerts = await fetchAlerts();
        const found = alerts.find((item) => item.id === id);
        if (!found) {
          setErrorMessage("Alert not found.");
          setAlert(null);
        } else {
          setAlert(found);
        }
      } catch (error) {
        if (showLoading) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load alert details.");
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };
  }, [id]);

  useEffect(() => {
    loadAlertRef.current(true);
  }, [id]);

  useEffect(() => {
    const connection = connectToAlertStatusUpdates(async (update) => {
      if (!id || update.alertId !== id) {
        return;
      }

      await loadAlertRef.current(false);
    });

    return () => connection.close();
  }, [id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !id || !alert) return;

    setIsPostingComment(true);
    try {
      await postAlertComment(id, newComment.trim());
      setNewComment("");
      await loadAlertRef.current(false);
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const alertTitle = useMemo(() => {
    if (!alert) {
      return "Campus Alert";
    }

    if (alert.title && alert.title.trim()) {
      return alert.title;
    }

    if (!alert.description) {
      return "Campus Alert";
    }

    return alert.description.split("\n\n")[0] || alert.description;
  }, [alert]);

  const alertBody = useMemo(() => {
    if (!alert?.description) {
      return "No description available.";
    }

    const parts = alert.description.split("\n\n");
    return parts.slice(1).join("\n\n") || alert.description;
  }, [alert]);

  const statusHistory = alert ? statusHistoryTemplate(alert.status, alert.createdAt, alert.updatedAt) : [];
  const commentEntries = alert?.statusHistory?.filter((entry) => entry.comment) || [];
  const locationText = alert?.locationText || alert?.geocodedAddress || "Unknown location";
  const reportedAt = alert?.createdAt ? formatAlertTime(alert.createdAt) : "Unknown";
  const updatedAt = alert?.updatedAt ? formatAlertTime(alert.updatedAt) : "Unknown";
  const resolvedAt = alert?.resolvedAt ? formatAlertTime(alert.resolvedAt) : "Pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#001f3f] border-b-2 border-[#003366] sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#003366]"
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/dashboard");
                }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">Alert Details</h1>
                <p className="text-xs text-gray-300">{alertTitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#003366]">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            Loading alert details...
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        ) : alert ? (
          <>
            <Card className="p-4 mb-6 border-2 border-yellow-300 bg-yellow-50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-yellow-900">Status: {normalizeStatusLabel(alert.status)}</p>
                    <p className="text-sm text-yellow-700">Updated {updatedAt}</p>
                  </div>
                </div>
                <Badge className={`border ${statusBadgeClass(alert.status)} whitespace-nowrap`}>
                  {normalizeStatusLabel(alert.status)}
                </Badge>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-2 border-gray-200 shadow-md">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-gray-200">{alert.category}</Badge>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300 border">
                      {alert.priority} Priority
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-[#001f3f] mb-3 truncate">{alertTitle}</h2>
                </div>
                <Button variant="outline" size="icon" className="border-2 border-gray-200">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{locationText}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported</p>
                    <p className="text-sm text-gray-600">{reportedAt}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported By</p>
                    <p className="text-sm text-gray-600">Campus user</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Updated</p>
                    <p className="text-sm text-gray-600">{updatedAt}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gray-300" />

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{alertBody}</p>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-2 border-gray-200 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Attachments ({alert.mediaAttachments?.length || 0})</h3>
              </div>
              {alert.mediaAttachments && alert.mediaAttachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {alert.mediaAttachments.map((media) => (
                    <MediaThumbnail
                      key={media.id}
                      media={media}
                      hasError={mediaLoadErrors.has(media.id)}
                      onError={() => setMediaLoadErrors((prev) => new Set([...prev, media.id]))}
                      onClick={() => setSelectedMedia(media)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No attachments</p>
                </div>
              )}
            </Card>

            <Card className="p-6 mb-6 border-2 border-gray-200 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {statusHistory.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === statusHistory.length - 1 ? "bg-yellow-500" : "bg-green-500"}`}></div>
                      {index < statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{normalizeStatusLabel(item.status as AlertStatus)}</span>
                        <span className="text-sm text-gray-500">{item.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.note}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-400">Resolved</span>
                      <span className="text-sm text-gray-400">{resolvedAt}</span>
                    </div>
                    <p className="text-sm text-gray-400">Pending completion</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Updates & Comments ({commentEntries.length})</h3>
              </div>
              <div className="space-y-4 mb-6">
                {commentEntries.length > 0 ? (
                  commentEntries.map((entry) => (
                    <div key={entry.id} className="flex gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{entry.changedByName}</span>
                          <span className="text-sm text-gray-500">{formatCommentTime(entry.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{entry.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
              <Separator className="my-4 bg-gray-300" />
              <div>
                <Label className="text-sm font-medium text-[#001f3f] mb-2 block">Add a comment</Label>
                <Textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Ask questions or provide additional information..."
                  rows={3}
                  className="mb-3 border-2 border-gray-200"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handlePostComment}
                    disabled={isPostingComment || !newComment.trim()}
                  >
                    {isPostingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </main>

      {/* Image Viewer Modal */}
      {selectedMedia && selectedMedia.mediaType === "PHOTO" && !mediaLoadErrors.has(selectedMedia.id) && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img
              src={getMediaUrl(selectedMedia)}
              alt={selectedMedia.originalFilename}
              className="w-full h-full object-contain"
            />
            <div className="bg-gray-100 px-4 py-3 text-sm text-gray-600 border-t">
              {selectedMedia.originalFilename}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
