import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { fetchAlerts } from "../api/alerts";
import type { AlertData, AlertStatus } from "../api/alerts";
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
} from "lucide-react";

const commentMocks = [
  {
    id: 1,
    author: "Campus Safety Team",
    role: "Operations",
    time: "15 mins ago",
    text: "We are reviewing this report and will follow up with the maintenance team shortly.",
  },
  {
    id: 2,
    author: "Facilities",
    role: "Maintenance",
    time: "30 mins ago",
    text: "The crew is on route and will inspect the location within the hour.",
  },
];

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

export function AlertDetailPage() {
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlert() {
      if (!id) {
        setErrorMessage("Alert ID is missing from the URL.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

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
        setErrorMessage(error instanceof Error ? error.message : "Unable to load alert details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAlert();
  }, [id]);

  const alertTitle = useMemo(() => {
    if (!alert?.description) {
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
  const locationText = alert?.locationText || alert?.geocodedAddress || "Unknown location";
  const reportedAt = alert?.createdAt ? formatAlertTime(alert.createdAt) : "Unknown";
  const updatedAt = alert?.updatedAt ? formatAlertTime(alert.updatedAt) : "Unknown";
  const resolvedAt = alert?.resolvedAt ? formatAlertTime(alert.resolvedAt) : "Pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#001f3f] border-b-2 border-[#003366] sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#003366]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">Alert Details</h1>
                <p className="text-xs text-gray-300">Alert ID: #{id ?? "unknown"}</p>
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
                <h3 className="font-semibold text-gray-900">Attachments</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-video bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
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
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">Sponsor This Repair</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Help expedite this maintenance work by contributing funds. Your donation will be used specifically for this repair.
                  </p>
                  <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make a Contribution
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Updates & Comments ({commentMocks.length})</h3>
              </div>
              <div className="space-y-4 mb-6">
                {commentMocks.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <Badge variant="outline" className="text-xs border-gray-300">{comment.role}</Badge>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4 bg-gray-300" />
              <div>
                <Label className="text-sm font-medium text-[#001f3f] mb-2 block">Add a comment</Label>
                <Textarea
                  placeholder="Ask questions or provide additional information..."
                  rows={3}
                  className="mb-3 border-2 border-gray-200"
                />
                <div className="flex justify-end">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Post Comment
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
