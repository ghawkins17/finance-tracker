import type { Request, Response } from "express";
import { getDashboardSummary as fetchDashboardSummary } from "../services/dashboard.service.js";

export function getDashboardSummary(req: Request, res: Response) {
  const summary = fetchDashboardSummary();
  res.json(summary);
}