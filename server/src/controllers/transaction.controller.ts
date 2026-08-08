import type { Request, Response } from "express";
import {
  createTransaction as saveTransaction,
  deleteTransaction as removeTransaction,
  getRecentTransactions as fetchRecentTransactions,
  getTransactions as fetchTransactions,
  updateTransaction as editTransaction,
} from "../services/transaction.service.js";

export async function getTransactions(req: Request, res: Response) {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
    const type = req.query.type === "income" || req.query.type === "expense"
      ? req.query.type
      : undefined;
    const sortBy = req.query.sortBy === "amount" ? "amount" : "transactionDate";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const from = typeof req.query.from === "string"
      ? new Date(`${req.query.from}T00:00:00.000Z`)
      : undefined;
    const to = typeof req.query.to === "string"
      ? new Date(`${req.query.to}T23:59:59.999Z`)
      : undefined;

    if (
      !Number.isInteger(page) || page < 1 ||
      !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
      (from && Number.isNaN(from.getTime())) ||
      (to && Number.isNaN(to.getTime())) ||
      (from && to && from > to)
    ) {
      return res.status(400).json({ message: "Invalid transaction filters." });
    }

    const result = await fetchTransactions(req.userId!, {
      page,
      pageSize,
      search: search || undefined,
      category: category || undefined,
      type,
      from,
      to,
      sortBy,
      sortOrder,
    });

    return res.json(result);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return res.status(500).json({ message: "Failed to fetch transactions." });
  }
}
/**
 * Returns all transactions from the database.
 */
export async function getRecentTransactions(
    req: Request,
    res: Response
) {
    try {
        const transactions = await fetchRecentTransactions(req.userId!);

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
    const {
      amount,
      description,
      category,
      type,
      transactionDate,
    } = req.body;

    const parsedTransactionDate = new Date(transactionDate);

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      (type !== "income" && type !== "expense") ||
      typeof transactionDate !== "string" ||
      Number.isNaN(parsedTransactionDate.getTime())
    ) {
      return res.status(400).json({
        message: "Valid transaction information is required.",
      });
    }

    const transaction = await saveTransaction(
      req.userId!,
      {
        amount,
        description: description.trim(),
        category: category.trim(),
        type,
        transactionDate: parsedTransactionDate,
      }
    );

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

    const deletedTransaction = await removeTransaction(id, req.userId!);

    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

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

    const {
      amount,
      description,
      category,
      type,
      transactionDate,
    } = req.body;

    const parsedTransactionDate = new Date(transactionDate);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "A valid transaction ID is required.",
      });
    }

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      (type !== "income" && type !== "expense") ||
      typeof transactionDate !== "string" ||
      Number.isNaN(parsedTransactionDate.getTime())
    ) {
      return res.status(400).json({
        message: "Valid transaction information is required.",
      });
    }

    const updatedTransaction = await editTransaction(
      id,
      req.userId!,
      {
        amount,
        description: description.trim(),
        category: category.trim(),
        type,
        transactionDate: parsedTransactionDate,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    return res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);

    return res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
}