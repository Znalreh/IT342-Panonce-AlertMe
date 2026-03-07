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
import { getAuthToken } from "./api/auth";

function requireAuth() {
  if (!getAuthToken()) {
    throw redirect("/login");
  }
  return null;
}

function redirectIfAuthenticated() {
  if (getAuthToken()) {
    throw redirect("/dashboard");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    loader: redirectIfAuthenticated,
    Component: LoginPage,
  },
  {
    path: "/register",
    loader: redirectIfAuthenticated,
    Component: RegisterPage,
  },
  {
    path: "/dashboard",
    loader: requireAuth,
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
    loader: requireAuth,
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