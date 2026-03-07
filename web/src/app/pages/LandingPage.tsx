import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Clock,
  MapPin,
  Bell,
  Users,
  Smartphone,
  CheckCircle,
  Zap,
  Eye,
  DollarSign,
  CloudRain,
  ChevronRight,
  Menu,
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-Time Reporting",
      description: "Report hazards in under 60 seconds with GPS-assisted location tracking",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "GPS Location",
      description: "Automatic location detection with manual precision editing",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Push Notifications",
      description: "Instant alerts for high-priority hazards in your area",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "Google OAuth 2.0 integration for verified institutional members",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Status Tracking",
      description: "Real-time updates from Received to Investigating to Resolved",
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      title: "Weather Integration",
      description: "External API provides context for environmental hazards",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile & Web",
      description: "Access from anywhere with native Android app and web dashboard",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Sponsor Repairs",
      description: "Crowdfund maintenance work with integrated payment gateway",
    },
  ];

  const stats = [
    { number: "500+", label: "Reports Submitted" },
    { number: "95%", label: "Resolution Rate" },
    { number: "<60s", label: "Average Report Time" },
    { number: "24/7", label: "Campus Monitoring" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-[#001f3f] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AlertMe</h1>
                <p className="text-xs text-gray-300 hidden md:block">Campus Safety Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-gray-200 hover:text-white font-medium transition-colors">About</a>
              <a href="#features" className="text-gray-200 hover:text-white font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-200 hover:text-white font-medium transition-colors">How It Works</a>
              <a href="#contact" className="text-gray-200 hover:text-white font-medium transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:block">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#001f3f] text-[#000000]">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Sign Up
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#003366]">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-[#001f3f] mb-4">
                Report Campus Hazards in Seconds
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                AlertMe streamlines communication between students, staff, and campus security. 
                Report infrastructure issues or security concerns directly from your device with full transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="border-2 border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f] hover:text-white w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-2xl font-bold text-red-600">{stat.number}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative">
              <Card className="border-2 border-gray-200 p-8 bg-white shadow-lg bg-[#001f3f]">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-red-600 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            
            <h3 className="text-3xl md:text-4xl font-bold text-[#001f3f] mb-4">
              Making Campus Safety Everyone's Priority
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AlertMe is a comprehensive real-time campus safety and hazard reporting platform designed 
              to bridge the communication gap between students, staff, and security personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white border-2 border-gray-200 text-center hover:border-red-600 transition-colors shadow-md">
              <div className="w-16 h-16 bg-red-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Our Mission</h4>
              <p className="text-gray-600">
                Empower campus communities to identify, report, and resolve safety hazards quickly and transparently.
              </p>
            </Card>

            <Card className="p-6 bg-white border-2 border-gray-200 text-center hover:border-[#001f3f] transition-colors shadow-md">
              <div className="w-16 h-16 bg-[#001f3f]/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-[#001f3f]" />
              </div>
              <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Our Community</h4>
              <p className="text-gray-600">
                Serving students, staff, and security personnel across educational institutions nationwide.
              </p>
            </Card>

            <Card className="p-6 bg-white border-2 border-gray-200 text-center hover:border-red-600 transition-colors shadow-md">
              <div className="w-16 h-16 bg-red-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Our Technology</h4>
              <p className="text-gray-600">
                Built with Spring Boot, React, and Android integration for seamless cross-platform experience.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            
            <h3 className="text-3xl md:text-4xl font-bold text-[#001f3f] mb-4">
              Everything You Need for Campus Safety
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and integrations designed to make reporting and resolving campus hazards effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-[#001f3f] text-white hover:bg-[#003366] transition-colors shadow-lg">
                <div className="w-12 h-12 bg-white/10 rounded-lg mb-4 flex items-center justify-center bg-[#f80000]">
                  {feature.icon}
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#001f3f] text-white border-[#001f3f] border mb-4">
              Simple Process
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold text-[#001f3f] mb-4">
              How AlertMe Works
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Report and resolve campus hazards in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <Card className="p-8 bg-white border-2 border-gray-200 text-center shadow-md">
                <div className="w-16 h-16 bg-[#001f3f] text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Report</h4>
                <p className="text-gray-600">
                  Spot a hazard? Report it instantly with location, photos, and description. Takes less than 60 seconds.
                </p>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ChevronRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-white border-2 border-gray-200 text-center shadow-md">
                <div className="w-16 h-16 bg-[#001f3f] text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Track</h4>
                <p className="text-gray-600">
                  Watch your report move through stages: Received → Investigating → Resolved. Get real-time updates.
                </p>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ChevronRight className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            <div>
              <Card className="p-8 bg-white border-2 border-gray-200 text-center shadow-md">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h4 className="text-xl font-semibold text-[#001f3f] mb-2">Resolve</h4>
                <p className="text-gray-600">
                  Campus staff address the issue and mark it resolved. Full transparency from start to finish.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#001f3f] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Your Campus Safer?
          </h3>
          <p className="text-lg text-gray-300 mb-8">
            Join hundreds of students and staff using AlertMe to create a safer campus environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                Create Free Account
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#001f3f] w-full sm:w-auto text-[#000000]">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#001f3f] text-white border-t border-[#003366]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white text-xl">AlertMe</span>
              </div>
              <p className="text-sm text-gray-300">
                Campus safety and hazard reporting platform for educational institutions.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#003366]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-300">
                © 2026 AlertMe Platform. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
