import type { Request, Response } from "express";
import { getRecentTransactions as fetchRecentTransactions } from "../services/transaction.service.js";

export function getRecentTransactions(
    req: Request,
    res: Response
) {

    const transactions = fetchRecentTransactions();

    res.json(transactions);

}