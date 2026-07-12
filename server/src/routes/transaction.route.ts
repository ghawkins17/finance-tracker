import { Router } from "express";
import {
    getRecentTransactions,
    createTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/recent", getRecentTransactions);
router.post("/", createTransaction);

export default router;