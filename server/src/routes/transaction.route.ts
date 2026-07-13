import { Router } from "express";
import {
    createTransaction,
    getRecentTransactions,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.get("/recent", getRecentTransactions);
transactionRouter.post("/", createTransaction);

export default transactionRouter;