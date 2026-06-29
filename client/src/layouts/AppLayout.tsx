import { Link, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-4">
        <h2>Finance Tracker</h2>

        <div>
          <Link to="/">Dashboard</Link>{" | "}
          <Link to="/login">Login</Link>{" | "}
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}