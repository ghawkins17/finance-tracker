import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import type { AuthOutletContext } from "../layouts/AppLayout";

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    isCheckingAuth,
  } = useOutletContext<AuthOutletContext>();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-slate-400">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}