import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { clearAuthToken } from "../api/auth";
import {
  AlertTriangle,
  ArrowLeft,
  User,
  Mail,
  Building,
  Shield,
  Bell,
  Eye,
  Lock,
  Download,
  Trash2,
  Edit,
  Save,
  LogOut,
} from "lucide-react";

export function ProfilePage() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-xs text-gray-500">Manage your account settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Profile Header */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">John Doe</h2>
              <p className="text-gray-600 mb-2">john.doe@university.edu</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 border">Student</Badge>
                <Badge variant="outline" className="border-gray-300">Engineering Department</Badge>
                <Badge variant="outline" className="border-gray-300">Member since Feb 2024</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-2 border-gray-300 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">12</p>
            <p className="text-sm text-gray-600">Reports Submitted</p>
          </Card>
          <Card className="p-4 border-2 border-gray-300 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">8</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </Card>
          <Card className="p-4 border-2 border-gray-300 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">4</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <Button variant="outline" size="sm" className="border-2 border-gray-300">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                <Input value="John" readOnly className="border-2 border-gray-300 bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                <Input value="Doe" readOnly className="border-2 border-gray-300 bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input value="john.doe@university.edu" readOnly className="border-2 border-gray-300 bg-gray-50" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </label>
              <Select defaultValue="student">
                <SelectTrigger className="border-2 border-gray-300 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="security">Security Guard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department/Building
              </label>
              <Input value="Engineering Department" readOnly className="border-2 border-gray-300 bg-gray-50" />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about your reports via email</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Get instant alerts on your device</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Status Updates</p>
                <p className="text-sm text-gray-600">Notify me when alert status changes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">New Alerts in My Area</p>
                <p className="text-sm text-gray-600">Get notified of nearby safety alerts</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Weekly Summary</p>
                <p className="text-sm text-gray-600">Receive a weekly digest of campus alerts</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Show My Name on Reports</p>
                <p className="text-sm text-gray-600">Display your name publicly on submitted alerts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Allow Staff Contact</p>
                <p className="text-sm text-gray-600">Let staff reach out for clarification on reports</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Anonymous Reporting</p>
                <p className="text-sm text-gray-600">Submit reports without revealing your identity</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-2 border-gray-300">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-2 border-gray-300">
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
              <Badge className="ml-auto bg-green-100 text-green-800 border-green-300">Enabled</Badge>
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-2 border-gray-300">
              <Eye className="w-4 h-4 mr-2" />
              Active Sessions
            </Button>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start border-2 border-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>

            <Button variant="outline" className="w-full justify-start border-2 border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </Card>

        {/* Save Changes Button */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full border-2 border-gray-300">
              Cancel
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
