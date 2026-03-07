import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { getGoogleAuthUrl, loginUser, saveAuthToken } from "../api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    if (!accessToken) {
      return;
    }

    saveAuthToken(accessToken);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const auth = await loginUser({
        email,
        password,
      });
      saveAuthToken(auth.accessToken);
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-[#001f3f] mb-2">AlertMe</h1>
          <p className="text-gray-600">Campus Safety & Hazard Reporting</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-[#001f3f] mb-6">Sign In</h2>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="sample@email.com"
                className="mt-1 border-gray-300"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                className="mt-1 border-gray-300"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-red-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#001f3f] hover:bg-[#003366] text-white disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
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
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 AlertMe Platform</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}