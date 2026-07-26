import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getRecentTransactions,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const transactionRouter = Router();

transactionRouter.use(requireAuth);

transactionRouter.get("/recent", getRecentTransactions);
transactionRouter.post("/", createTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);

export default transactionRouter;