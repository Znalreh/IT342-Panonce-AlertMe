import { createBrowserRouter, redirect } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportAlertPage } from "./pages/ReportAlertPage";
import { AlertDetailPage } from "./pages/AlertDetailPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BrowseAlertsPage } from "./pages/BrowseAlertsPage";
import { getAuthToken, getCurrentUser, saveAuthToken } from "./api/auth";

export function requireAuth() {
  if (!getAuthToken()) {
    throw redirect("/login");
  }
  return null;
}

export async function requireStudentDashboard() {
  if (!getAuthToken()) {
    throw redirect("/login");
  }

  try {
    const user = await getCurrentUser();
    if (user.role !== "STUDENT") {
      throw new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    // If we can't get user info, redirect to login
    throw redirect("/login");
  }

  return null;
}

export async function requireAdmin() {
  if (!getAuthToken()) {
    throw redirect("/login");
  }

  try {
    const user = await getCurrentUser();
    if (user.role === "STUDENT") {
      throw new Response("Not Found", { status: 404 });
    }
    // Allow ADMIN, STAFF, SECURITY roles
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    // If we can't get user info, redirect to login
    throw redirect("/login");
  }

  return null;
}

export async function redirectAuthenticatedUser({ request }: { request: Request }) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get("accessToken");

  if (accessToken) {
    saveAuthToken(accessToken);
    return null;
  }

  if (!getAuthToken()) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    if (user.role === "STUDENT") {
      return redirect("/dashboard");
    } else {
      return redirect("/admin");
    }
  } catch (error) {
    return null;
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    loader: redirectAuthenticatedUser,
    Component: LoginPage,
  },
  {
    path: "/register",
    loader: redirectAuthenticatedUser,
    Component: RegisterPage,
  },
  {
    path: "/dashboard",
    loader: requireStudentDashboard,
    Component: DashboardPage,
  },
  {
    path: "/report",
    loader: requireAuth,
    Component: ReportAlertPage,
  },
  {
    path: "/alert/:id",
    loader: requireAuth,
    Component: AlertDetailPage,
  },
  {
    path: "/admin",
    loader: requireAdmin,
    Component: AdminDashboardPage,
  },
  {
    path: "/profile",
    loader: requireAuth,
    Component: ProfilePage,
  },
  {
    path: "/browse",
    loader: requireAuth,
    Component: BrowseAlertsPage,
  },
  

]);