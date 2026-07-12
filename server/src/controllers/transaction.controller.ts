import type { Request, Response } from "express";
import {
    getRecentTransactions as fetchRecentTransactions,
    createTransaction as createNewTransaction,
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

        const transaction = await createNewTransaction(
            amount,
            description,
            category,
            type
        );

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Error creating transaction:", error);

        res.status(500).json({
            message: "Failed to create transaction.",
        });
    }
}