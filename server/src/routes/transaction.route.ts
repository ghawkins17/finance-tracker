import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getRecentTransactions,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.get("/recent", getRecentTransactions);
transactionRouter.post("/", createTransaction);
transactionRouter.delete("/:id", deleteTransaction);

export default transactionRouter;