import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getRecentTransactions,
  updateTransaction,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.get("/recent", getRecentTransactions);
transactionRouter.post("/", createTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);


export default transactionRouter;