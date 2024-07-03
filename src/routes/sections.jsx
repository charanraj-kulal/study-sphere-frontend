// src/routes/sections.jsx
import { lazy, Suspense } from "react";
import { Outlet, Navigate, useRoutes } from "react-router-dom";
import DashboardLayout from "../layouts/dashboard";
import SkeletonLoader from "../components/SkeletonLoader"; // Ensure correct extension

// Lazy load your components
export const IndexPage = lazy(() => import("../pages/app"));
export const Home = lazy(() => import("../pages/Home"));
export const BlogPage = lazy(() => import("../pages/blog"));
export const UserPage = lazy(() => import("../pages/user"));
export const LoginPage = lazy(() => import("../pages/SignInSignUpFrom"));
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
      element: (
        <DashboardLayout>
          <Suspense fallback={<SkeletonLoader />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: "user", element: <UserPage /> },
        { path: "products", element: <ProductsPage /> },
        { path: "blog", element: <BlogPage /> },
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