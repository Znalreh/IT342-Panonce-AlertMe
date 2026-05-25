import { Link } from "react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { fetchAlerts } from "../api/alerts";
import { getCurrentUser } from "../api/auth";
import { connectToAlertStatusUpdates } from "../api/websocket";
import type { AlertData, AlertStatus } from "../api/alerts";
import {
  AlertTriangle,
  Plus,
  Search,
  Bell,
  User,
  MapPin,
  Clock,
  AlertCircle,
  Wrench,
  Shield,
  Filter,
  Menu,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "Security" | "Infrastructure" | "Environmental">("ALL");
  const [showMyReports, setShowMyReports] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const loadAlertsRef = useRef(() => {});

  useEffect(() => {
    // Check for error parameter in URL
    const error = searchParams.get("error");
    if (error === "access_denied") {
      setErrorMessage("Access denied. Admin privileges required to view the admin dashboard.");
      // Clear the error from URL
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    async function loadAlerts() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load alerts.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAlerts();
  }, []);

  // Add polling for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to poll alerts:", error);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const profile = await getCurrentUser();
        setCurrentUserEmail(profile.email.toLowerCase());
      } catch {
        setCurrentUserEmail(null);
      }
    }

    loadCurrentUser();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const connection = connectToAlertStatusUpdates(async (update) => {
      try {
        const alertDisplay = update.alertTitle || `Alert ${update.alertId}`;
        const notification: NotificationItem = {
          id: `${update.alertId}-${update.status}-${Date.now()}`,
          title: "Alert status updated",
          message: `${alertDisplay} status changed to ${update.status.toLowerCase()}.`,
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 6));
        await loadAlertsRef.current();
      } catch (error) {
        console.error("Failed to refresh alerts after WebSocket update:", error);
      }
    });

    return () => connection.close();
  }, []);

  useEffect(() => {
    loadAlertsRef.current = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to refresh alerts:", error);
      }
    };
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    }
  }, [isNotificationsOpen]);

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesStatus = statusFilter === "ALL" || alert.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || alert.category === categoryFilter;
      const matchesReporter = !showMyReports || (currentUserEmail != null && alert.reporterEmail?.toLowerCase() === currentUserEmail);
      const combined = [
        alert.category,
        alert.title,
        alert.description,
        alert.locationText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedSearch || combined.includes(normalizedSearch);
      return matchesStatus && matchesCategory && matchesReporter && matchesSearch;
    });
  }, [alerts, searchTerm, statusFilter, categoryFilter, showMyReports, currentUserEmail]);

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((alert) => alert.status !== "RESOLVED").length;
  const resolvedAlerts = alerts.filter((alert) => alert.status === "RESOLVED").length;
  const highPriorityAlerts = alerts.filter((alert) => alert.priority === "HIGH").length;

  const recentAlerts = filteredAlerts.slice(0, 5);

  const getStatusColor = (status: AlertStatus) => {
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
  };

  const getPriorityColor = (priority: AlertData["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security":
        return <Shield className="w-4 h-4" />;
      case "Infrastructure":
        return <Wrench className="w-4 h-4" />;
      case "Environmental":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatAlertTime = (timestamp?: string) => {
    if (!timestamp) {
      return "Unknown time";
    }

    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#001f3f] border-b-2 border-[#003366] sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#003366]">
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AlertMe</h1>
                  <p className="text-xs text-gray-300 hidden md:block">Campus Safety Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-[#003366]"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                )}
              </Button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">Notifications</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => setNotifications([])}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-600">No new notifications.</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border-b border-gray-100 px-4 py-3 ${notification.read ? "bg-white" : "bg-blue-50"}`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                          <p className="mt-1 text-[11px] text-gray-400">{new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/profile">
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#003366]">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-[#001f3f]">{totalAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-[#001f3f]/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#001f3f]" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{activeAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search alerts by location, category, or description..."
              className="pl-10 border-2 border-gray-200"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatus | "ALL")}>
              <SelectTrigger className="w-40 border-2 border-gray-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/report">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Report Alert
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${categoryFilter === "ALL" && !showMyReports ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-gray-200 text-gray-700 hover:border-[#001f3f] hover:text-[#001f3f]"}`}
            onClick={() => {
              setShowMyReports(false);
              setCategoryFilter("ALL");
            }}
          >
            All Alerts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`border-2 whitespace-nowrap ${categoryFilter === "Security" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-gray-200 text-gray-700 hover:border-[#001f3f] hover:text-[#001f3f]"}`}
            onClick={() => {
              setShowMyReports(false);
              setCategoryFilter("Security");
            }}
          >
            <Shield className="w-4 h-4 mr-1" />
            Security
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`border-2 whitespace-nowrap ${categoryFilter === "Infrastructure" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-gray-200 text-gray-700 hover:border-[#001f3f] hover:text-[#001f3f]"}`}
            onClick={() => {
              setShowMyReports(false);
              setCategoryFilter("Infrastructure");
            }}
          >
            <Wrench className="w-4 h-4 mr-1" />
            Infrastructure
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`border-2 whitespace-nowrap ${categoryFilter === "Environmental" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-gray-200 text-gray-700 hover:border-[#001f3f] hover:text-[#001f3f]"}`}
            onClick={() => {
              setShowMyReports(false);
              setCategoryFilter("Environmental");
            }}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Environmental
          </Button>
        </div>

        {/* Recent Alerts Feed */}
        <div>
          <h2 className="text-lg font-semibold text-[#001f3f] mb-4">Recent Alerts</h2>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
              Loading alerts...
            </div>
          ) : (
            <div className="space-y-4">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <Link key={alert.id} to={`/alert/${alert.id}`}>
                    <Card className="p-5 border-2 border-gray-200 hover:border-[#001f3f] transition-colors cursor-pointer shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-[#001f3f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getCategoryIcon(alert.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#001f3f] mb-1">{alert.title || alert.description.split("\n")[0] || alert.category}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{alert.locationText}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge className={`border ${getStatusColor(alert.status)} whitespace-nowrap`}>
                            {alert.status}
                          </Badge>
                          <Badge className={`border ${getPriorityColor(alert.priority)} whitespace-nowrap`}>
                            {alert.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatAlertTime(alert.createdAt)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-200">
                          {alert.category}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                  No alerts match your search or filters.
                </div>
              )}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-6">
            <Link to="/browse">
              <Button variant="outline" className="border-2 border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f] hover:text-white">
                View All Alerts
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#001f3f]">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/report" className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-600">
            <Plus className="w-5 h-5" />
            <span className="text-xs">Report</span>
          </Link>
          <Link to="/browse" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#001f3f]">
            <Search className="w-5 h-5" />
            <span className="text-xs">Browse</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#001f3f]">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
