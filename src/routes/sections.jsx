// src/routes/sections.jsx
import { lazy, Suspense } from "react";
import { Outlet, Navigate, useRoutes } from "react-router-dom";
import DashboardLayout from "../layouts/dashboard";
import SkeletonLoader from "../components/SkeletonLoader";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardRedirect from "./components/dashboard-redirect";

// Lazy load your components
export const IndexPage = lazy(() => import("../pages/app"));
export const Home = lazy(() => import("../pages/Home"));
export const BlogPage = lazy(() => import("../pages/blog"));
export const UploadPage = lazy(() => import("../pages/upload"));
export const DownloadPage = lazy(() => import("../pages/download"));
export const VerifyPage = lazy(() => import("../pages/verify-studyMaterial"));
export const UserPage = lazy(() => import("../pages/user"));
export const StudentsPage = lazy(() => import("../pages/students"));
export const LeaderboardPage = lazy(() => import("../pages/leaderboard"));
export const LoginPage = lazy(() => import("../pages/SignInSignUpFrom"));
export const UserProfilePage = lazy(() => import("../pages/UserProfile"));
// export const LoginPage = lazy(() => import("../pages/login"));
export const ReportPage = lazy(() => import("../pages/reports"));
export const AddProductsPage = lazy(() => import("../pages/addProducts"));
export const ProductsPage = lazy(() => import("../pages/products"));
export const Page404 = lazy(() => import("../pages/page-not-found"));

// Router component definition
export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <Suspense fallback={<SkeletonLoader />}>
          <Home />
        </Suspense>
      ),
    },
    {
      path: "dashboard",
      element: <ProtectedRoute />, // Use ProtectedRoute here
      children: [
        {
          element: (
            <DashboardLayout>
              <Suspense fallback={<SkeletonLoader />}>
                <Outlet />
              </Suspense>
            </DashboardLayout>
          ),
          children: [
            { element: <DashboardRedirect />, index: true },
            { path: "dashboard", element: <IndexPage /> },
            { path: "user", element: <UserPage /> },
            { path: "students", element: <StudentsPage /> },
            { path: "verify", element: <VerifyPage /> },
            { path: "upload", element: <UploadPage /> },
            { path: "download", element: <DownloadPage /> },
            { path: "leaderboard", element: <LeaderboardPage /> },
            { path: "products", element: <ProductsPage /> },
            { path: "addproducts", element: <AddProductsPage /> },
            { path: "reports", element: <ReportPage /> },
            { path: "blog", element: <BlogPage /> },
            { path: "profile/:userId", element: <UserProfilePage /> },
          ],
        },
      ],
    },
    {
      path: "login",
      element: (
        <Suspense fallback={<SkeletonLoader />}>
          <LoginPage />
        </Suspense>
      ),
    },
    {
      path: "404",
      element: (
        <Suspense fallback={<SkeletonLoader />}>
          <Page404 />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
