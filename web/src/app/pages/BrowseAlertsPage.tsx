import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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

export function BrowseAlertsPage() {
  const mockAlerts = [
    {
      id: "1",
      title: "Broken Light in Parking Lot B",
      category: "Infrastructure",
      status: "Investigating",
      location: "Parking Lot B, Section 3",
      time: "15 mins ago",
      priority: "Medium",
      description: "Several lights are not working in the north section",
    },
    {
      id: "2",
      title: "Suspicious Activity Near Library",
      category: "Security",
      status: "Received",
      location: "Main Library, East Entrance",
      time: "1 hour ago",
      priority: "High",
      description: "Unknown individual attempting to access restricted area",
    },
    {
      id: "3",
      title: "Water Leak in Building A",
      category: "Infrastructure",
      status: "Resolved",
      location: "Building A, Room 402",
      time: "3 hours ago",
      priority: "High",
      description: "Ceiling leak causing water damage",
    },
    {
      id: "4",
      title: "Icy Walkway Near Dormitory",
      category: "Environmental",
      status: "Received",
      location: "West Dormitory Main Path",
      time: "5 hours ago",
      priority: "High",
      description: "Walkway extremely slippery due to ice formation",
    },
    {
      id: "5",
      title: "Broken Door Lock",
      category: "Infrastructure",
      status: "Investigating",
      location: "Engineering Building, Room 205",
      time: "1 day ago",
      priority: "Medium",
      description: "Door lock not functioning properly",
    },
    {
      id: "6",
      title: "Graffiti on Building Wall",
      category: "Security",
      status: "Received",
      location: "Science Building, West Side",
      time: "2 days ago",
      priority: "Low",
      description: "Vandalism discovered on exterior wall",
    },
    {
      id: "7",
      title: "Pothole in Main Road",
      category: "Infrastructure",
      status: "Investigating",
      location: "Campus Main Road, Near Gate 2",
      time: "3 days ago",
      priority: "Medium",
      description: "Large pothole causing traffic disruption",
    },
    {
      id: "8",
      title: "Fallen Tree Branch",
      category: "Environmental",
      status: "Resolved",
      location: "Central Park Area",
      time: "1 week ago",
      priority: "Medium",
      description: "Tree branch blocking walkway after storm",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Investigating":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Browse Alerts</h1>
                <p className="text-xs text-gray-500">View all campus safety reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-20">
        {/* Search and Filter Bar */}
        <Card className="p-4 mb-6 border-2 border-gray-300">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search alerts by title, location, or description..."
                className="pl-10 border-2 border-gray-300"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Select>
                <SelectTrigger className="border-2 border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="border-2 border-gray-300">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="border-2 border-gray-300">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="border-2 border-gray-300">
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
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap">
            All ({mockAlerts.length})
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-red-300 text-red-700 hover:bg-red-50 whitespace-nowrap">
            High Priority (3)
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 whitespace-nowrap">
            New (2)
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 whitespace-nowrap">
            In Progress (3)
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-green-300 text-green-700 hover:bg-green-50 whitespace-nowrap">
            Resolved (2)
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{mockAlerts.length}</span> alerts
          </p>
          <Select defaultValue="recent">
            <SelectTrigger className="w-48 border-2 border-gray-300 h-9">
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

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {mockAlerts.map((alert) => (
            <Link key={alert.id} to={`/alert/${alert.id}`}>
              <Card className="p-5 border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{alert.location}</span>
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
                    <span>{alert.time}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="border-2 border-gray-300 px-8">
            Load More Alerts
          </Button>
        </div>
      </main>
    </div>
  );
}
