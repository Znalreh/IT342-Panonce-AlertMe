import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { clearAuthToken, getCurrentUser, updateUserProfile, changeUserPassword } from "../api/auth";
import type { UserProfile } from "../api/auth";
import { fetchAlerts } from "../api/alerts";
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
  Trash2,
  Edit,
  Save,
} from "lucide-react";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reportsSubmitted, setReportsSubmitted] = useState(0);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [resolvedAlertsCount, setResolvedAlertsCount] = useState(0);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthToken();
    navigate('/login');
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUser();
        setProfile(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);

        const alerts = await fetchAlerts();
        const myAlerts = alerts.filter(
          (alert) => alert.reporterEmail?.toLowerCase() === user.email.toLowerCase()
        );

        setReportsSubmitted(myAlerts.length);
        setActiveAlertsCount(myAlerts.filter((alert) => alert.status !== "RESOLVED").length);
        setResolvedAlertsCount(myAlerts.filter((alert) => alert.status === "RESOLVED").length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : "Loading profile...";
  const displayEmail = profile?.email ?? "Loading...";
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <div>
                <h1 className="text-xl font-bold text-white">My Profile</h1>
                <p className="text-xs text-gray-300">Manage your account settings</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[#001f3f] border-white hover:bg-white "
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {loading && (
          <div className="mb-6 rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-700">
            Loading profile information...
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#001f3f] mb-1">{displayName}</h2>
              <p className="text-gray-600 mb-2">{displayEmail}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 border">
                  {profile ? profile.role : "Loading..."}
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  {profile ? `Member since ${memberSince}` : "Member since ..."}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-2 border-gray-200 shadow-md text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">{reportsSubmitted}</p>
            <p className="text-sm text-gray-600">Reports Submitted</p>
          </Card>
          <Card className="p-4 border-2 border-gray-200 shadow-md text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">{activeAlertsCount}</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </Card>
          <Card className="p-4 border-2 border-gray-200 shadow-md text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">{resolvedAlertsCount}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-gray-300"
                onClick={() => {
                  setEditMode((prev) => !prev);
                  setProfileSuccess(null);
                  setProfileError(null);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  readOnly={!editMode}
                  className={`border-2 border-gray-300 ${editMode ? "bg-white" : "bg-gray-50"}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  readOnly={!editMode}
                  className={`border-2 border-gray-300 ${editMode ? "bg-white" : "bg-gray-50"}`}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                value={email}
                readOnly
                className="border-2 border-gray-300 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </label>
              <Input value={profile?.role ?? "Loading..."} readOnly className="border-2 border-gray-300 bg-gray-50" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department/Building
              </label>
              <Input value={profile ? "Not set" : "Loading..."} readOnly className="border-2 border-gray-300 bg-gray-50" />
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

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Status Updates</p>
                <p className="text-sm text-gray-600">Notify me when alert status changes</p>
              </div>
              <Switch defaultChecked />
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
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start border-2 border-gray-300"
                onClick={() => {
                  setChangePasswordOpen((prev) => !prev);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              {changePasswordOpen && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                  {passwordSuccess && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="border-2 border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="border-2 border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="border-2 border-gray-300 bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-2 border-gray-300"
                      onClick={() => {
                        setChangePasswordOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={async () => {
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        if (newPassword !== confirmPassword) {
                          setPasswordError("New password and confirmation do not match.");
                          return;
                        }
                        try {
                          await changeUserPassword({ currentPassword, newPassword });
                          setPasswordSuccess("Password changed successfully.");
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        } catch (err) {
                          setPasswordError(err instanceof Error ? err.message : "Unable to change password.");
                        }
                      }}
                    >
                      Save Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </Card>

        {profileError && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {profileSuccess}
          </div>
        )}
        {/* Save Changes Button */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              setProfileError(null);
              setProfileSuccess(null);
              try {
                const updatedProfile = await updateUserProfile({ firstName, lastName });
                setProfile(updatedProfile);
                setProfileSuccess("Profile updated successfully.");
                setEditMode(false);
              } catch (err) {
                setProfileError(err instanceof Error ? err.message : "Unable to save changes.");
              }
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full border-2 border-gray-200 hover:border-[#001f3f]">
              Cancel
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
