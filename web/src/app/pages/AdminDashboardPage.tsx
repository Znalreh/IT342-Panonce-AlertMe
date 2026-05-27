import { Link } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Menu,
  Bell,
  User,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
import {
  fetchAdminStats,
  fetchAlertsForAdmin,
  updateAlertStatus,
  assignAlert,
  deleteAlert,
  type AdminStats,
  type AlertData,
  type AlertStatus,
  type AlertPriority,
  type AdminAlertsFilters,
} from "../api/alerts";
import { connectToAlertStatusUpdates, type AlertStatusUpdate } from "../api/websocket";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminAlertsFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [filters, selectedTab]);

  // Add polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts();
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [filters, selectedTab]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, alertsData] = await Promise.all([
        fetchAdminStats(),
        fetchAlertsForAdmin()
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load admin data.";
      console.error("Failed to load admin data:", error);
      setError(message);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const tabFilters: AdminAlertsFilters = { ...filters };
      if (selectedTab === "new") {
        tabFilters.status = "RECEIVED";
      } else if (selectedTab === "active") {
        tabFilters.status = "INVESTIGATING";
      } else if (selectedTab === "resolved") {
        tabFilters.status = "RESOLVED";
      }

      if (searchQuery.trim()) {
        tabFilters.search = searchQuery.trim();
      }

      const alertsData = await fetchAlertsForAdmin(tabFilters);
      setAlerts(alertsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load alerts.";
      console.error("Failed to load alerts:", error);
      setError(message);
      setAlerts([]);
    }
  }, [filters, selectedTab, searchQuery]);

  const loadDataRef = useRef(loadData);
  const loadAlertsRef = useRef(loadAlerts);

  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    loadAlertsRef.current = loadAlerts;
  }, [loadAlerts]);

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
        await loadDataRef.current();
      } catch (error) {
        console.error("Failed to refresh alerts after WebSocket update:", error);
      }
    });

    return () => connection.close();
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    }
  }, [isNotificationsOpen]);

  const handleStatusChange = async (alertId: string, newStatus: AlertStatus) => {
    try {
      setUpdatingStatus(alertId);
      await updateAlertStatus(alertId, newStatus);
      // Update local state immediately for better UX
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ));
      // Refresh stats as well
      loadData();
    } catch (error) {
      console.error("Failed to update alert status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSearch = () => {
    loadAlerts();
  };

  const handleDeleteAlert = async (alertId: string) => {
    const confirmed = window.confirm(
      "Delete this alert? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingAlertId(alertId);
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      await loadData();
      await loadAlerts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete alert.";
      console.error("Failed to delete alert:", error);
      setError(message);
    } finally {
      setDeletingAlertId(null);
    }
  };

  const handleFilterChange = (key: keyof AdminAlertsFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const getFilteredAlerts = () => {
    return alerts;
  };

  const mockAlerts = alerts.map(alert => ({
    id: alert.id,
    title: alert.title || alert.description.split('\n')[0] || alert.description,
    category: alert.category,
    status: alert.status,
    location: alert.locationText,
    reportedBy: alert.reporterEmail || "Unknown",
    time: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "Unknown",
    priority: alert.priority,
    assignedTo: alert.assignedToName || "Not Assigned",
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEIVED":
      case "Received":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "INVESTIGATING":
      case "Investigating":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "RESOLVED":
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
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
                  <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-xs text-gray-300 hidden md:block">Manage all campus alerts</p>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Alerts</p>
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalAlerts || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </Card>

          <Card className="p-4 border-2 border-blue-300 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-700">New/Received</p>
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.receivedAlerts || 0}
            </p>
            <p className="text-xs text-blue-600 mt-1">Needs assignment</p>
          </Card>

          <Card className="p-4 border-2 border-yellow-300 bg-yellow-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-700">In Progress</p>
              <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.investigatingAlerts || 0}
            </p>
            <p className="text-xs text-yellow-600 mt-1">Active investigations</p>
          </Card>

          <Card className="p-4 border-2 border-green-300 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-700">Resolved</p>
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.resolvedAlerts || 0}
            </p>
            <p className="text-xs text-green-600 mt-1">This month</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-white border-2 border-gray-300">
            <TabsTrigger value="all">All Alerts ({stats?.totalAlerts || 0})</TabsTrigger>
            <TabsTrigger value="new">New ({stats?.receivedAlerts || 0})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats?.investigatingAlerts || 0})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({stats?.resolvedAlerts || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters and Search */}
            <Card className="p-4 border-2 border-gray-200 shadow-md">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by ID, title, location, or reporter..."
                    className="pl-10 border-2 border-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filters.category ?? "all"} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger className="w-40 border-2 border-gray-300">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Environmental">Environmental</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.priority ?? "all"} onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger className="w-40 border-2 border-gray-300">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" className="border-2 border-gray-300" onClick={handleSearch}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Alerts Table */}
            {error && !loading && (
              <Card className="p-4 border-2 border-red-200 bg-red-50 text-red-700 mb-4">
                {error}
              </Card>
            )}
            {mockAlerts.length > 0 ? (
              <div className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="w-1/3 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input type="checkbox" className="mr-2" />
                            Alert
                          </th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Priority</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden xl:table-cell">Assigned</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden 2xl:table-cell">Reporter</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Time</th>
                          <th className="w-20 px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockAlerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-gray-50">
                            <td className="w-1/3 px-3 py-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <input type="checkbox" className="mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/alert/${alert.id}`} className="font-medium text-gray-900 hover:underline block truncate">
                                    {alert.title}
                                  </Link>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{alert.location}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-gray-300 mt-1">
                                    {alert.category}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="w-20 px-3 py-3">
                              <Select
                                value={alert.status.toLowerCase()}
                                onValueChange={(value) => handleStatusChange(alert.id, value.toUpperCase() as AlertStatus)}
                                disabled={updatingStatus === alert.id}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs border ${getStatusColor(alert.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="w-20 px-3 py-3 hidden lg:table-cell">
                              <Badge className={`border text-xs ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </Badge>
                            </td>
                            <td className="w-24 px-3 py-3 hidden xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.assignedTo}</span>
                            </td>
                            <td className="w-20 px-3 py-3 hidden 2xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.reportedBy}</span>
                            </td>
                            <td className="w-24 px-3 py-3 hidden lg:table-cell">
                              <span className="text-xs text-gray-500 truncate block">{alert.time}</span>
                            </td>
                            <td className="w-20 px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Link to={`/alert/${alert.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  disabled={deletingAlertId === alert.id}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Pagination */}
                <div className="px-4 py-3 border-t-2 border-gray-300 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-medium">1-{mockAlerts.length}</span> of <span className="font-medium">{mockAlerts.length}</span> alerts
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled className="border-2 border-gray-300">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={mockAlerts.length <= 5} className="border-2 border-gray-300">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="p-8 border-2 border-gray-300 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
                <p className="text-gray-600">No alerts found. Confirm the backend is running and that your account has admin access.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="new">
            {mockAlerts.length > 0 ? (
              <div className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="w-1/3 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input type="checkbox" className="mr-2" />
                            Alert
                          </th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Priority</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden xl:table-cell">Assigned</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden 2xl:table-cell">Reporter</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Time</th>
                          <th className="w-20 px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockAlerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-gray-50">
                            <td className="w-1/3 px-3 py-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <input type="checkbox" className="mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/alert/${alert.id}`} className="font-medium text-gray-900 hover:underline block truncate">
                                    {alert.title}
                                  </Link>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{alert.location}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-gray-300 mt-1">
                                    {alert.category}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="w-20 px-3 py-3">
                              <Select
                                value={alert.status.toLowerCase()}
                                onValueChange={(value) => handleStatusChange(alert.id, value.toUpperCase() as AlertStatus)}
                                disabled={updatingStatus === alert.id}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs border ${getStatusColor(alert.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="w-20 px-3 py-3 hidden lg:table-cell">
                              <Badge className={`border text-xs ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </Badge>
                            </td>
                            <td className="w-24 px-3 py-3 hidden xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.assignedTo}</span>
                            </td>
                            <td className="w-20 px-3 py-3 hidden 2xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.reportedBy}</span>
                            </td>
                            <td className="w-24 px-3 py-3 hidden lg:table-cell">
                              <span className="text-xs text-gray-500 truncate block">{alert.time}</span>
                            </td>
                            <td className="w-20 px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Link to={`/alert/${alert.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  disabled={deletingAlertId === alert.id}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 border-2 border-gray-300 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No New Alerts</h3>
                <p className="text-gray-600">All alerts have been processed. Check back later for new reports.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active">
            {mockAlerts.length > 0 ? (
              <div className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="w-1/3 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input type="checkbox" className="mr-2" />
                            Alert
                          </th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Priority</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden xl:table-cell">Assigned</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden 2xl:table-cell">Reporter</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Time</th>
                          <th className="w-20 px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockAlerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-gray-50">
                            <td className="w-1/3 px-3 py-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <input type="checkbox" className="mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/alert/${alert.id}`} className="font-medium text-gray-900 hover:underline block truncate">
                                    {alert.title}
                                  </Link>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{alert.location}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-gray-300 mt-1">
                                    {alert.category}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="w-20 px-3 py-3">
                              <Select
                                value={alert.status.toLowerCase()}
                                onValueChange={(value) => handleStatusChange(alert.id, value.toUpperCase() as AlertStatus)}
                                disabled={updatingStatus === alert.id}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs border ${getStatusColor(alert.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="w-20 px-3 py-3 hidden lg:table-cell">
                              <Badge className={`border text-xs ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </Badge>
                            </td>
                            <td className="w-24 px-3 py-3 hidden xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.assignedTo}</span>
                            </td>
                            <td className="w-20 px-3 py-3 hidden 2xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.reportedBy}</span>
                            </td>
                            <td className="w-24 px-3 py-3 hidden lg:table-cell">
                              <span className="text-xs text-gray-500 truncate block">{alert.time}</span>
                            </td>
                            <td className="w-20 px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Link to={`/alert/${alert.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  disabled={deletingAlertId === alert.id}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 border-2 border-gray-300 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">No alerts are currently being investigated.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {mockAlerts.length > 0 ? (
              <div className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="w-1/3 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input type="checkbox" className="mr-2" />
                            Alert
                          </th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Priority</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden xl:table-cell">Assigned</th>
                          <th className="w-20 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden 2xl:table-cell">Reporter</th>
                          <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Time</th>
                          <th className="w-20 px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockAlerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-gray-50">
                            <td className="w-1/3 px-3 py-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <input type="checkbox" className="mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/alert/${alert.id}`} className="font-medium text-gray-900 hover:underline block truncate">
                                    {alert.title}
                                  </Link>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{alert.location}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-gray-300 mt-1">
                                    {alert.category}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="w-20 px-3 py-3">
                              <Select
                                value={alert.status.toLowerCase()}
                                onValueChange={(value) => handleStatusChange(alert.id, value.toUpperCase() as AlertStatus)}
                                disabled={updatingStatus === alert.id}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs border ${getStatusColor(alert.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="w-20 px-3 py-3 hidden lg:table-cell">
                              <Badge className={`border text-xs ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </Badge>
                            </td>
                            <td className="w-24 px-3 py-3 hidden xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.assignedTo}</span>
                            </td>
                            <td className="w-20 px-3 py-3 hidden 2xl:table-cell">
                              <span className="text-xs text-gray-700 truncate block">{alert.reportedBy}</span>
                            </td>
                            <td className="w-24 px-3 py-3 hidden lg:table-cell">
                              <span className="text-xs text-gray-500 truncate block">{alert.time}</span>
                            </td>
                            <td className="w-20 px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Link to={`/alert/${alert.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  disabled={deletingAlertId === alert.id}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 border-2 border-gray-300 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resolved Alerts</h3>
                <p className="text-gray-600">No alerts have been resolved yet.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
