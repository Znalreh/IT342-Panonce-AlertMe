import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { fetchAlerts } from "../api/alerts";
import type { AlertData, AlertPriority, AlertStatus } from "../api/alerts";
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  Shield,
  Wrench,
  AlertCircle,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";

const CATEGORY_FILTER_VALUES = ["ALL", "Security", "Infrastructure", "Environmental"] as const;
const DATE_FILTER_VALUES = ["all", "today", "week", "month"] as const;

export function BrowseAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<typeof CATEGORY_FILTER_VALUES[number]>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<typeof DATE_FILTER_VALUES[number]>("all");
  const [quickFilter, setQuickFilter] = useState<"ALL" | "HIGH_PRIORITY" | "NEW" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const now = new Date();

    return alerts.filter((alert) => {
      const matchesStatus = statusFilter === "ALL" || alert.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || alert.category === categoryFilter;
      const matchesPriority = priorityFilter === "ALL" || alert.priority === priorityFilter;
      const combinedText = [alert.category, alert.title, alert.description, alert.locationText, alert.geocodedAddress]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || combinedText.includes(normalizedSearch);

      let matchesDate = true;
      if (alert.createdAt && dateFilter !== "all") {
        const createdAt = new Date(alert.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === "today") {
          matchesDate = diffDays < 1;
        } else if (dateFilter === "week") {
          matchesDate = diffDays < 7;
        } else if (dateFilter === "month") {
          matchesDate = diffDays < 30;
        }
      }

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch && matchesDate;
    });
  }, [alerts, categoryFilter, dateFilter, priorityFilter, searchTerm, statusFilter]);

  const totalAlerts = alerts.length;
  const highPriorityAlerts = alerts.filter((alert) => alert.priority === "HIGH").length;
  const newAlerts = alerts.filter((alert) => alert.status === "RECEIVED").length;
  const inProgressAlerts = alerts.filter((alert) => alert.status === "INVESTIGATING").length;
  const resolvedAlerts = alerts.filter((alert) => alert.status === "RESOLVED").length;

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

  const getPriorityColor = (priority: AlertPriority) => {
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
        <div className="max-w-6xl mx-auto px-4 py-4">
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
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Browse Alerts</h1>
                <p className="text-xs text-gray-300">View all campus safety reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-20">
        {/* Search and Filter Bar */}
        <Card className="p-4 mb-6 border-2 border-gray-200 shadow-md">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search alerts by title, location, or description..."
                className="pl-10 border-2 border-gray-200"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatus | "ALL") }>
                <SelectTrigger className="border-2 border-gray-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as typeof CATEGORY_FILTER_VALUES[number])}>
                <SelectTrigger className="border-2 border-gray-200">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as AlertPriority | "ALL") }>
                <SelectTrigger className="border-2 border-gray-200">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof DATE_FILTER_VALUES[number])}>
                <SelectTrigger className="border-2 border-gray-200">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Quick Filter Tags */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${quickFilter === "ALL" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-2 border-gray-200 text-gray-700 hover:border-[#001f3f] hover:text-[#001f3f]"}`}
            onClick={() => {
              setQuickFilter("ALL");
              setStatusFilter("ALL");
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
            }}
          >
            All ({totalAlerts})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${quickFilter === "HIGH_PRIORITY" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-2 border-red-300 text-red-700 hover:bg-red-50"}`}
            onClick={() => {
              setQuickFilter("HIGH_PRIORITY");
              setPriorityFilter("HIGH");
              setStatusFilter("ALL");
              setCategoryFilter("ALL");
            }}
          >
            High Priority ({highPriorityAlerts})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${quickFilter === "NEW" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-2 border-blue-300 text-blue-700 hover:bg-blue-50"}`}
            onClick={() => {
              setQuickFilter("NEW");
              setStatusFilter("RECEIVED");
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
            }}
          >
            New ({newAlerts})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${quickFilter === "IN_PROGRESS" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"}`}
            onClick={() => {
              setQuickFilter("IN_PROGRESS");
              setStatusFilter("INVESTIGATING");
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
            }}
          >
            Investifating ({inProgressAlerts})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`whitespace-nowrap ${quickFilter === "RESOLVED" ? "bg-[#001f3f] text-white border-[#001f3f]" : "border-2 border-green-300 text-green-700 hover:bg-green-50"}`}
            onClick={() => {
              setQuickFilter("RESOLVED");
              setStatusFilter("RESOLVED");
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
            }}
          >
            Resolved ({resolvedAlerts})
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredAlerts.length}</span> alerts
          </p>
          <Select value="recent">
            <SelectTrigger className="w-48 border-2 border-gray-200 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priority">Highest Priority</SelectItem>
              <SelectItem value="location">By Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Link key={alert.id} to={`/alert/${alert.id}`}>
                  <Card className="p-5 border-2 border-gray-200 hover:border-[#001f3f] transition-colors cursor-pointer h-full shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-[#001f3f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(alert.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#001f3f] mb-1 line-clamp-2">{alert.title || alert.description.split("\n")[0] || alert.category}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{alert.locationText || alert.geocodedAddress || "Unknown location"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Badge className={`border text-xs ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </Badge>
                        <Badge className={`border text-xs ${getPriorityColor(alert.priority)}`}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatAlertTime(alert.createdAt)}</span>
                      </div>
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

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="border-2 border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f] hover:text-white px-8">
            Load More Alerts
          </Button>
        </div>
      </main>
    </div>
  );
}
