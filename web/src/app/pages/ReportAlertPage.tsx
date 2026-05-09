import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { createAlert } from "../api/alerts";
import type { AlertPriority } from "../api/alerts";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { LocationMap } from "../components/LocationMap";
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

const categoryOptions = [
  {
    label: "Security",
    value: "Security",
    description: "Suspicious activity, threats",
  },
  {
    label: "Infrastructure",
    value: "Infrastructure",
    description: "Broken equipment, leaks",
  },
  {
    label: "Environmental",
    value: "Environmental",
    description: "Weather hazards, debris",
  },
];

const priorityOptions: Array<{ value: AlertPriority; label: string; description: string }> = [
  {
    value: "HIGH",
    label: "High",
    description: "Immediate danger or security threat",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Needs attention soon",
  },
  {
    value: "LOW",
    label: "Low",
    description: "Non-urgent maintenance",
  },
];

export function ReportAlertPage() {
  const navigate = useNavigate();
  const [useGPS, setUseGPS] = useState(false);
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [title, setTitle] = useState("");
  const [locationText, setLocationText] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [priority, setPriority] = useState<AlertPriority>("HIGH");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // GPS-related state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // File attachments state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (useGPS && !locationText.trim()) {
      setLocationText("Engineering Building");
    }
  }, [useGPS]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate("/dashboard");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, successMessage]);

  // Get current GPS location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || undefined;

          if (address) {
            setGeocodedAddress(address);
            if (!locationText.trim()) {
              setLocationText(address);
            }
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        let errorMsg = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out.";
            break;
        }
        setErrorMessage(errorMsg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Handle GPS toggle
  const handleGPSToggle = () => {
    const newUseGPS = !useGPS;
    setUseGPS(newUseGPS);

    if (newUseGPS && !latitude && !longitude) {
      getCurrentLocation();
    }
  };

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number, address?: string) => {
    setLatitude(lat);
    setLongitude(lng);

    if (address) {
      setGeocodedAddress(address);
      // Auto-fill location text with selected address
      setLocationText(address);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Filter for images and videos, max 10MB each
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 files
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const finalLocation = [locationText.trim(), building.trim(), room.trim()]
      .filter(Boolean)
      .join(", ");

    if (!finalLocation) {
      setErrorMessage("Please provide a location for the alert.");
      return;
    }

    if (!description.trim() && !title.trim()) {
      setErrorMessage("Please provide a title or a detailed description.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAlert({
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        locationText: finalLocation,
        latitude: useGPS && latitude ? latitude : undefined,
        longitude: useGPS && longitude ? longitude : undefined,
        geocodedAddress: useGPS && geocodedAddress ? geocodedAddress : undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setSuccessMessage("Your alert has been submitted. Thank you for keeping the campus safe.");
      setTitle("");
      setDescription("");
      setBuilding("");
      setRoom("");
      if (!useGPS) {
        setLocationText("");
      }
      // Reset GPS state
      setLatitude(null);
      setLongitude(null);
      setGeocodedAddress("");
      setUseGPS(false);
      // Reset files
      setSelectedFiles([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not submit alert.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#001f3f] border-b-2 border-[#003366] sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#003366]" type="button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Report New Alert</h1>
                <p className="text-xs text-gray-300">Submit a safety or hazard report</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        

        {errorMessage && (
          <Card className="p-4 mb-6 border border-red-200 bg-red-50 text-red-700">
            <p>{errorMessage}</p>
          </Card>
        )}

        {successMessage && (
          <Card className="p-4 mb-6 border border-green-200 bg-green-50 text-green-700">
            <p>{successMessage}</p>
          </Card>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <Label className="text-[#001f3f] font-semibold mb-3 block">
              Alert Category <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categoryOptions.map((option) => {
                const selected = category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selected ? "border-[#001f3f] bg-[#001f3f]/10" : "border-gray-200 hover:border-[#001f3f] hover:bg-[#001f3f]/5"
                    }`}
                    onClick={() => setCategory(option.value)}
                  >
                    <div className="w-12 h-12 bg-[#001f3f]/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-[#001f3f]" />
                    </div>
                    <p className="font-medium text-[#001f3f] text-sm">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <Label htmlFor="title" className="text-[#001f3f] font-semibold">
              Alert Title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Brief description of the issue"
              className="mt-2 border-2 border-gray-200"
            />
            <p className="text-xs text-gray-500 mt-1">Keep it short and descriptive (e.g., "Broken light in Parking Lot B")</p>
          </Card>

          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="location" className="text-[#001f3f] font-semibold">
                Location <span className="text-red-600">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-2 border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f] hover:text-white"
                onClick={handleGPSToggle}
                disabled={isGettingLocation}
              >
                <Locate className="w-4 h-4 mr-2" />
                {isGettingLocation ? "Getting Location..." : useGPS ? "GPS Active" : "Use Map GPS"}
              </Button>
            </div>

            {useGPS && (
              <div className="mb-4">
                <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {latitude && longitude
                      ? `Location selected: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° W`
                      : "Getting your location..."
                    }
                  </span>
                </div>

                {latitude && longitude && (
                  <LocationMap
                    latitude={latitude}
                    longitude={longitude}
                    onLocationSelect={handleLocationSelect}
                    className="rounded-lg border-2 border-gray-200 overflow-hidden"
                  />
                )}
              </div>
            )}

            <Input
              id="location"
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              placeholder="Building name and room number"
              className="mb-2 border-2 border-gray-200"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="building" className="text-sm text-gray-600">Building/Area</Label>
                <Input
                  id="building"
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="e.g., Parking Lot B"
                  className="mt-1 border-2 border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="room" className="text-sm text-gray-600">Room/Section</Label>
                <Input
                  id="room"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="e.g., Room 402"
                  className="mt-1 border-2 border-gray-200"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>GPS provides approximate location. Please add specific room/section details.</span>
            </p>
          </Card>

          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <Label htmlFor="priority" className="text-[#001f3f] font-semibold">
              Priority Level <span className="text-red-600">*</span>
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as AlertPriority)}>
              <SelectTrigger id="priority" className="mt-2 border-2 border-gray-200">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          option.value === "HIGH" ? "bg-red-600" : option.value === "MEDIUM" ? "bg-orange-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span>{option.label} - {option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <Label htmlFor="description" className="text-[#001f3f] font-semibold">
              Detailed Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Provide as much detail as possible about the hazard or issue..."
              rows={5}
              className="mt-2 border-2 border-gray-200"
            />
            <p className="text-xs text-gray-500 mt-1">Include when you noticed it, how severe it is, and any other relevant details</p>
          </Card>

          <Card className="p-5 border-2 border-gray-200 shadow-md">
            <Label className="text-[#001f3f] font-semibold mb-3 block">Attachments (Optional)</Label>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-[#001f3f] transition-colors">
              <div className="w-12 h-12 bg-[#001f3f]/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#001f3f]" />
              </div>
              <p className="text-sm font-medium text-[#001f3f] mb-1">Upload photos or videos</p>
              <p className="text-xs text-gray-500 mb-3">PNG, JPG, MP4 up to 10MB each (max 10 files)</p>
              <div className="flex items-center justify-center gap-2">
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-md hover:border-[#001f3f] hover:text-[#001f3f] cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-[#001f3f]/10 rounded flex-shrink-0 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <CloudRain className="w-6 h-6 text-[#001f3f]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#001f3f] truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="px-8 py-3 bg-[#001f3f] text-white hover:bg-[#003366]" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Alert"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
