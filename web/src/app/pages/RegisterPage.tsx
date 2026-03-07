import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertTriangle } from "lucide-react";
import { getGoogleAuthUrl, registerUser, saveAuthToken } from "../api/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STUDENT" | "STAFF" | "SECURITY">("STUDENT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = await registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      saveAuthToken(auth.accessToken);
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create your account. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-[#001f3f] mb-2">AlertMe</h1>
          <p className="text-gray-600">Create Your Account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-[#001f3f] mb-6">Register</h2>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="mt-1 border-gray-300"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="mt-1 border-gray-300"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-gray-700">University Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  className="mt-1 border-gray-300"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-gray-700">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as "STUDENT" | "STAFF" | "SECURITY")}>
                  <SelectTrigger className="mt-1 border-gray-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="SECURITY">Security Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="department" className="text-gray-700">Department/Building (Optional)</Label>
              <Input
                id="department"
                type="text"
                placeholder="Engineering, Admin, etc."
                className="mt-1 border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="mt-1 border-gray-300"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="mt-1 border-gray-300"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="flex items-start text-sm pt-2">
              <input type="checkbox" className="mr-2 mt-1" />
              <label className="text-gray-600">
                I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#001f3f] hover:bg-[#003366] text-white disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="my-6">
            <Separator className="bg-gray-200" />
            <div className="text-center -mt-3">
              <span className="bg-white px-3 text-sm text-gray-500">OR</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full border-2 border-gray-200 hover:bg-gray-50"
            onClick={() => {
              window.location.href = getGoogleAuthUrl();
            }}
          >
            <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}