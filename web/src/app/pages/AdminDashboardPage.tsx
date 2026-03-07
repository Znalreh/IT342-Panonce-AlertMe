import { Link } from "react-router";
import { useState } from "react";
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
} from "lucide-react";

export function AdminDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const mockAlerts = [
    {
      id: "1",
      title: "Broken Light in Parking Lot B",
      category: "Infrastructure",
      status: "Investigating",
      location: "Parking Lot B, Section 3",
      reportedBy: "John Doe",
      time: "15 mins ago",
      priority: "Medium",
      assignedTo: "Maintenance Team",
    },
    {
      id: "2",
      title: "Suspicious Activity Near Library",
      category: "Security",
      status: "Received",
      location: "Main Library, East Entrance",
      reportedBy: "Sarah Smith",
      time: "1 hour ago",
      priority: "High",
      assignedTo: "Not Assigned",
    },
    {
      id: "3",
      title: "Water Leak in Building A",
      category: "Infrastructure",
      status: "Resolved",
      location: "Building A, Room 402",
      reportedBy: "Mike Johnson",
      time: "3 hours ago",
      priority: "High",
      assignedTo: "Plumbing Services",
    },
    {
      id: "4",
      title: "Icy Walkway Near Dormitory",
      category: "Environmental",
      status: "Received",
      location: "West Dormitory Main Path",
      reportedBy: "Emily Chen",
      time: "5 hours ago",
      priority: "High",
      assignedTo: "Not Assigned",
    },
    {
      id: "5",
      title: "Broken Door Lock",
      category: "Infrastructure",
      status: "Investigating",
      location: "Engineering Building, Room 205",
      reportedBy: "Alex Brown",
      time: "1 day ago",
      priority: "Medium",
      assignedTo: "Security Team",
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
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500 hidden md:block">Manage all campus alerts</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden md:flex border-2 border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Alerts</p>
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">127</p>
            <p className="text-xs text-gray-500 mt-1">+12 from last week</p>
          </Card>

          <Card className="p-4 border-2 border-blue-300 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-700">New/Received</p>
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-900">6</p>
            <p className="text-xs text-blue-600 mt-1">Needs assignment</p>
          </Card>

          <Card className="p-4 border-2 border-yellow-300 bg-yellow-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-700">In Progress</p>
              <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-900">23</p>
            <p className="text-xs text-yellow-600 mt-1">Active investigations</p>
          </Card>

          <Card className="p-4 border-2 border-green-300 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-700">Resolved</p>
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-900">98</p>
            <p className="text-xs text-green-600 mt-1">This month</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Report
          </Button>
          <Button variant="outline" className="border-2 border-gray-300">
            <Users className="w-4 h-4 mr-2" />
            Manage Teams
          </Button>
          <Button variant="outline" className="border-2 border-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-white border-2 border-gray-300">
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters and Search */}
            <Card className="p-4 border-2 border-gray-300">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by ID, title, location, or reporter..."
                    className="pl-10 border-2 border-gray-300"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-40 border-2 border-gray-300">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-40 border-2 border-gray-300">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" className="border-2 border-gray-300">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Alerts Table */}
            <Card className="border-2 border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        <input type="checkbox" className="mr-2" />
                        Alert
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden md:table-cell">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Assigned To</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden xl:table-cell">Reporter</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden md:table-cell">Time</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" className="mt-1" />
                            <div className="min-w-0">
                              <Link to={`/alert/${alert.id}`} className="font-medium text-gray-900 hover:underline block">
                                {alert.title}
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{alert.location}</span>
                              </div>
                              <Badge variant="outline" className="text-xs border-gray-300 mt-1">
                                {alert.category}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Select defaultValue={alert.status.toLowerCase()}>
                            <SelectTrigger className={`w-32 h-8 text-xs border ${getStatusColor(alert.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">Received</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <Badge className={`border ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-700">{alert.assignedTo}</span>
                        </td>
                        <td className="px-4 py-4 hidden xl:table-cell">
                          <span className="text-sm text-gray-700">{alert.reportedBy}</span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-500">{alert.time}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/alert/${alert.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t-2 border-gray-300 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">1-5</span> of <span className="font-medium">127</span> alerts
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="border-2 border-gray-300">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="border-2 border-gray-300">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card className="p-8 border-2 border-gray-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New Alerts (6)</h3>
              <p className="text-gray-600">Showing only alerts with "Received" status that need assignment</p>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card className="p-8 border-2 border-gray-300 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Alerts (23)</h3>
              <p className="text-gray-600">Showing only alerts currently being investigated</p>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card className="p-8 border-2 border-gray-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolved Alerts (98)</h3>
              <p className="text-gray-600">Showing only alerts marked as resolved</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
