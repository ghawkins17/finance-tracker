import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createBudget as saveBudget,
  deleteBudget as removeBudget,
  getBudgets as fetchBudgets,
  updateBudget as editBudget,
} from "../services/budget.service.js";

function parseMonth(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return null;
  }

  return new Date(`${value}-01T00:00:00.000Z`);
}

function parseBudgetBody(body: unknown) {
  if (!body || typeof body !== "object") return null;

  const { category, amount, month } = body as Record<string, unknown>;
  const parsedMonth = parseMonth(month);

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 100 ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !parsedMonth
  ) {
    return null;
  }

  return { category: category.trim(), amount, month: parsedMonth };
}

function isUniqueBudgetError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function getBudgets(req: Request, res: Response) {
  try {
    const defaultMonth = new Date().toISOString().slice(0, 7);
    const month = parseMonth(req.query.month ?? defaultMonth);
    if (!month) {
      return res.status(400).json({ message: "Month must use YYYY-MM format." });
    }

    const budgets = await fetchBudgets(req.userId!, month);
    return res.json({ month: month.toISOString().slice(0, 7), budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return res.status(500).json({ message: "Failed to fetch budgets." });
  }
}

export async function createBudget(req: Request, res: Response) {
  try {
    const data = parseBudgetBody(req.body);
    if (!data) {
      return res.status(400).json({
        message: "Valid category, amount, and month are required.",
      });
    }

    const budget = await saveBudget(req.userId!, data);
    return res.status(201).json(budget);
  } catch (error) {
    if (isUniqueBudgetError(error)) {
      return res.status(409).json({
        message: "A budget already exists for this category and month.",
      });
    }
    console.error("Error creating budget:", error);
    return res.status(500).json({ message: "Failed to create budget." });
  }
}

export async function updateBudget(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = parseBudgetBody(req.body);
    if (!Number.isInteger(id) || id <= 0 || !data) {
      return res.status(400).json({
        message: "A valid budget and budget ID are required.",
      });
    }

    const budget = await editBudget(id, req.userId!, data);
    if (!budget) return res.status(404).json({ message: "Budget not found." });
    return res.json(budget);
  } catch (error) {
    if (isUniqueBudgetError(error)) {
      return res.status(409).json({
        message: "A budget already exists for this category and month.",
      });
    }
    console.error("Error updating budget:", error);
    return res.status(500).json({ message: "Failed to update budget." });
  }
}

export async function deleteBudget(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "A valid budget ID is required." });
    }

    const budget = await removeBudget(id, req.userId!);
    if (!budget) return res.status(404).json({ message: "Budget not found." });
    return res.json(budget);
  } catch (error) {
    console.error("Error deleting budget:", error);
    return res.status(500).json({ message: "Failed to delete budget." });
  }
}