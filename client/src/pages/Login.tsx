import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import type { AuthOutletContext } from "../layouts/AppLayout";

export default function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useOutletContext<AuthOutletContext>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      await api.post("/auth/login", {
        email,
        password,
      });

      setIsAuthenticated(true);
      navigate("/", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ?? "Unable to log in."
        );
      } else {
        setError("Unable to log in.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-slate-800 p-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold">Login</h1>

        <p className="mt-2 text-slate-400">
          Sign in to access your financial dashboard.
        </p>

        <div className="mt-6">
          <label htmlFor="email" className="mb-2 block font-medium">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="mb-2 block font-medium">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}