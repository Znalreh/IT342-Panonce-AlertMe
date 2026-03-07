import { Link } from "react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card } from "../components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Upload,
  X,
  Camera,
  Locate,
  CloudRain,
  Info,
} from "lucide-react";

export function ReportAlertPage() {
  const [useGPS, setUseGPS] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
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
                <h1 className="text-xl font-bold text-gray-900">Report New Alert</h1>
                <p className="text-xs text-gray-500">Submit a safety or hazard report</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {/* Weather Context Card */}
        <Card className="p-4 mb-6 border-2 border-blue-300 bg-blue-50">
          <div className="flex items-start gap-3">
            <CloudRain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Weather Alert</h3>
              <p className="text-sm text-blue-700">
                Current: 28°F, Icy conditions. Be cautious of slippery surfaces.
              </p>
            </div>
          </div>
        </Card>

        {/* Report Form */}
        <form className="space-y-6">
          {/* Alert Category */}
          <Card className="p-5 border-2 border-gray-300">
            <Label className="text-gray-900 font-semibold mb-3 block">
              Alert Category <span className="text-red-500">*</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">Security</p>
                <p className="text-xs text-gray-500 mt-1">Suspicious activity, threats</p>
              </button>

              <button
                type="button"
                className="p-4 border-2 border-gray-900 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">Infrastructure</p>
                <p className="text-xs text-gray-500 mt-1">Broken equipment, leaks</p>
              </button>

              <button
                type="button"
                className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">Environmental</p>
                <p className="text-xs text-gray-500 mt-1">Weather hazards, debris</p>
              </button>
            </div>
          </Card>

          {/* Title */}
          <Card className="p-5 border-2 border-gray-300">
            <Label htmlFor="title" className="text-gray-900 font-semibold">
              Alert Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              className="mt-2 border-2 border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Keep it short and descriptive (e.g., "Broken light in Parking Lot B")</p>
          </Card>

          {/* Location */}
          <Card className="p-5 border-2 border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="location" className="text-gray-900 font-semibold">
                Location <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-2 border-gray-300"
                onClick={() => setUseGPS(!useGPS)}
              >
                <Locate className="w-4 h-4 mr-2" />
                {useGPS ? "GPS Active" : "Use GPS"}
              </Button>
            </div>

            {useGPS && (
              <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">GPS location acquired: 40.7128° N, 74.0060° W</span>
              </div>
            )}

            <Input
              id="location"
              placeholder="Building name and room number"
              defaultValue={useGPS ? "Engineering Building" : ""}
              className="mb-2 border-2 border-gray-300"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="building" className="text-sm text-gray-600">Building/Area</Label>
                <Input
                  id="building"
                  placeholder="e.g., Parking Lot B"
                  className="mt-1 border-2 border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="room" className="text-sm text-gray-600">Room/Section</Label>
                <Input
                  id="room"
                  placeholder="e.g., Room 402"
                  className="mt-1 border-2 border-gray-300"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>GPS provides approximate location. Please add specific room/section details.</span>
            </p>
          </Card>

          {/* Priority Level */}
          <Card className="p-5 border-2 border-gray-300">
            <Label htmlFor="priority" className="text-gray-900 font-semibold">
              Priority Level <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger id="priority" className="mt-2 border-2 border-gray-300">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>High - Immediate danger or security threat</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Medium - Needs attention soon</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Low - Non-urgent maintenance</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Description */}
          <Card className="p-5 border-2 border-gray-300">
            <Label htmlFor="description" className="text-gray-900 font-semibold">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide as much detail as possible about the hazard or issue..."
              rows={5}
              className="mt-2 border-2 border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Include when you noticed it, how severe it is, and any other relevant details</p>
          </Card>

          {/* Photo/Video Upload */}
          <Card className="p-5 border-2 border-gray-300">
            <Label className="text-gray-900 font-semibold mb-3 block">
              Attachments (Optional)
            </Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Upload photos or videos</p>
              <p className="text-xs text-gray-500 mb-3">
                PNG, JPG, MP4 up to 10MB each
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button type="button" size="sm" variant="outline" className="border-2 border-gray-300">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button type="button" size="sm" variant="outline" className="border-2 border-gray-300">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>

            {/* Preview uploaded files */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">IMG_2024_001.jpg</p>
                  <p className="text-xs text-gray-500">2.4 MB</p>
                </div>
                <Button type="button" variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-5 border-2 border-gray-300">
            <Label className="text-gray-900 font-semibold mb-3 block">
              Contact Preference
            </Label>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Notify me of status updates via email</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Send push notifications</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-gray-700">Allow staff to contact me for clarification</span>
              </label>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Link to="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full border-2 border-gray-300">
                Cancel
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Submit Report
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
