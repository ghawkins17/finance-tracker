import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../services/api";


export type AuthOutletContext = {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        await api.get("/auth/me");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, [location.pathname]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await api.post("/auth/logout");

      setIsAuthenticated(false);
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-4">
        <h2>Finance Tracker</h2>

        <div className="flex items-center gap-4">
          <Link to="/">Dashboard</Link>
          {!isCheckingAuth && isAuthenticated && (
            <Link to="/transactions">Transactions</Link>
          )}

          {!isCheckingAuth && !isAuthenticated && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {!isCheckingAuth && isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </nav>

      <main>
        <Outlet
          context={{
            isAuthenticated,
            isCheckingAuth,
            setIsAuthenticated,
          }}
        />
      </main>
    </div>
  );
}