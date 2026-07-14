import type { Request, Response } from "express";
import {
  createTransaction as saveTransaction,
  deleteTransaction as removeTransaction,
  getRecentTransactions as fetchRecentTransactions,
  updateTransaction as editTransaction,
} from "../services/transaction.service.js";

/**
 * Returns all transactions from the database.
 */
export async function getRecentTransactions(
    req: Request,
    res: Response
) {
    try {
        const transactions = await fetchRecentTransactions();

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);

        res.status(500).json({
            message: "Failed to fetch transactions.",
        });
    }
}

/**
 * Creates a new transaction.
 */
export async function createTransaction(
    req: Request,
    res: Response
) {
    try {
        const { amount, description, category, type } = req.body;

        if (
            typeof amount !== "number" ||
            typeof description !== "string" ||
            typeof category !== "string" ||
            typeof type !== "string"
        ) {
            return res.status(400).json({
                message:
                    "amount, description, category, and type are required.",
            });
        }

        const transaction = await saveTransaction({
            amount,
            description,
            category,
            type,
        });

        return res.status(201).json(transaction);
    } catch (error) {
        console.error("Error creating transaction:", error);

        return res.status(500).json({
            message: "Failed to create transaction.",
        });
    }
}

/**
 * Deletes a transaction by its ID.
 */
export async function deleteTransaction(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "A valid transaction ID is required.",
      });
    }

    const deletedTransaction = await removeTransaction(id);

    return res.json(deletedTransaction);
  } catch (error) {
    console.error("Error deleting transaction:", error);

    return res.status(500).json({
      message: "Failed to delete transaction.",
    });
  }
}

/**
 * Updates an existing transaction by its ID.
 */
export async function updateTransaction(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { amount, description, category, type } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "A valid transaction ID is required.",
      });
    }

    if (
      typeof amount !== "number" ||
      typeof description !== "string" ||
      typeof category !== "string" ||
      (type !== "income" && type !== "expense")
    ) {
      return res.status(400).json({
        message: "Valid amount, description, category, and type are required.",
      });
    }

    const updatedTransaction = await editTransaction(id, {
      amount,
      description,
      category,
      type,
    });

    return res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);

    return res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
}