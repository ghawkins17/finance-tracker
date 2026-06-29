import { Router } from "express";
import { getRecentTransactions } from "../controllers/transaction.controller.js";

const router = Router();

router.get("/recent", getRecentTransactions);

export default router;