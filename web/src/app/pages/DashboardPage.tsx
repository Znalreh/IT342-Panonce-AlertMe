import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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

export function DashboardPage() {
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AlertMe</h1>
                  <p className="text-xs text-gray-500 hidden md:block">Campus Safety Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
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
          <Card className="p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-yellow-600">23</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">98</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">6</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
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
              placeholder="Search alerts by location, category, or description..."
              className="pl-10 border-2 border-gray-300"
            />
          </div>
          
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-40 border-2 border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/report">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Report Alert
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Link to="/browse">
            <Button variant="outline" size="sm" className="border-2 border-gray-300 whitespace-nowrap">
              All Alerts
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="border-2 border-gray-300 whitespace-nowrap">
            My Reports
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-gray-300 whitespace-nowrap">
            <Shield className="w-4 h-4 mr-1" />
            Security
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-gray-300 whitespace-nowrap">
            <Wrench className="w-4 h-4 mr-1" />
            Infrastructure
          </Button>
          <Button variant="outline" size="sm" className="border-2 border-gray-300 whitespace-nowrap">
            <AlertCircle className="w-4 h-4 mr-1" />
            Environmental
          </Button>
        </div>

        {/* Recent Alerts Feed */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <Link key={alert.id} to={`/alert/${alert.id}`}>
                <Card className="p-5 border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(alert.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{alert.location}</span>
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
                      <span>{alert.time}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-gray-300">
                      {alert.category}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-6">
            <Link to="/browse">
              <Button variant="outline" className="border-2 border-gray-300">
                View All Alerts
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300">
        <div className="flex justify-around py-3">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-900">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/report" className="flex flex-col items-center gap-1 text-gray-500">
            <Plus className="w-5 h-5" />
            <span className="text-xs">Report</span>
          </Link>
          <Link to="/browse" className="flex flex-col items-center gap-1 text-gray-500">
            <Search className="w-5 h-5" />
            <span className="text-xs">Browse</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
