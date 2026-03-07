import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Share2,
  Flag,
  DollarSign,
} from "lucide-react";

export function AlertDetailPage() {
  const alert = {
    id: "1",
    title: "Broken Light in Parking Lot B",
    category: "Infrastructure",
    status: "Investigating",
    priority: "Medium",
    location: "Parking Lot B, Section 3",
    building: "Parking Lot B",
    room: "Section 3",
    description: "Several lights are not working in the north section of Parking Lot B. This has been an issue for the past two days. The area becomes very dark at night, creating a safety concern for students walking to their vehicles after evening classes.",
    reportedBy: "John Doe (Student)",
    reportedAt: "Feb 28, 2026 at 2:45 PM",
    updatedAt: "Feb 28, 2026 at 3:00 PM",
    assignedTo: "Maintenance Team - Building Services",
    estimatedResolution: "March 2, 2026",
    images: [1, 2],
    comments: [
      {
        id: 1,
        author: "Sarah Johnson (Staff)",
        role: "Facilities Manager",
        time: "15 mins ago",
        text: "Thank you for reporting this. We've dispatched our electrical team to assess the situation. They should arrive within the hour.",
      },
      {
        id: 2,
        author: "Mike Chen (Security)",
        role: "Campus Security",
        time: "30 mins ago",
        text: "We've increased patrols in this area until the lights are fixed. Stay safe!",
      },
    ],
  };

  const statusHistory = [
    {
      status: "Received",
      time: "Feb 28, 2026 at 2:45 PM",
      note: "Alert submitted by John Doe",
    },
    {
      status: "Investigating",
      time: "Feb 28, 2026 at 3:00 PM",
      note: "Assigned to Maintenance Team",
    },
  ];

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
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">Alert Details</h1>
                <p className="text-xs text-gray-500">Alert ID: #{alert.id}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Status Banner */}
        <Card className="p-4 mb-6 border-2 border-yellow-300 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="font-semibold text-yellow-900">Status: Investigating</p>
                <p className="text-sm text-yellow-700">Updated 15 mins ago</p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 border">
              In Progress
            </Badge>
          </div>
        </Card>

        {/* Alert Header */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-gray-300">{alert.category}</Badge>
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 border">
                  {alert.priority} Priority
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{alert.title}</h2>
            </div>
            <Button variant="outline" size="icon" className="border-2 border-gray-300">
              <Flag className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{alert.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Reported</p>
                <p className="text-sm text-gray-600">{alert.reportedAt}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Reported By</p>
                <p className="text-sm text-gray-600">{alert.reportedBy}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Assigned To</p>
                <p className="text-sm text-gray-600">{alert.assignedTo}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-gray-300" />

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{alert.description}</p>
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Attachments ({alert.images.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {alert.images.map((img, index) => (
              <div key={index} className="aspect-video bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        </Card>

        {/* Status Timeline */}
        <Card className="p-6 mb-6 border-2 border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4">Status Timeline</h3>
          
          <div className="space-y-4">
            {statusHistory.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === statusHistory.length - 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  {index < statusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{item.status}</span>
                    <span className="text-sm text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.note}</p>
                </div>
              </div>
            ))}
            
            {/* Future status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-400">Resolved</span>
                  <span className="text-sm text-gray-400">Est. {alert.estimatedResolution}</span>
                </div>
                <p className="text-sm text-gray-400">Pending completion</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sponsor a Repair */}
        <Card className="p-6 mb-6 border-2 border-green-300 bg-green-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Sponsor This Repair</h3>
              <p className="text-sm text-green-700 mb-3">
                Help expedite this maintenance work by contributing funds. Your donation will be used specifically for this repair.
              </p>
              <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Make a Contribution
              </Button>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6 border-2 border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Updates & Comments ({alert.comments.length})</h3>
          </div>

          {/* Existing Comments */}
          <div className="space-y-4 mb-6">
            {alert.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <Badge variant="outline" className="text-xs border-gray-300">{comment.role}</Badge>
                    <span className="text-sm text-gray-500">{comment.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4 bg-gray-300" />

          {/* Add Comment */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Add a comment</Label>
            <Textarea
              placeholder="Ask questions or provide additional information..."
              rows={3}
              className="mb-3 border-2 border-gray-300"
            />
            <div className="flex justify-end">
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                Post Comment
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
