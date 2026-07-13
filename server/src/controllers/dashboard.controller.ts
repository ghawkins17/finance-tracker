/**
 * Controller for handling dashboard-related requests.
 * This controller defines the endpoints for fetching dashboard data, such as the summary of income, expenses, and balance.
 */

import type { Request, Response } from "express";
import { dashboardSummary } from "../services/dashboard.service.js";

export async function getDashboardSummary(
  req: Request,
  res: Response
) {
  try {
    const summary = await dashboardSummary();

    res.json(summary);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard summary.",
    });
  }
}