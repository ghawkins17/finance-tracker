import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../controllers/budget.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const budgetRouter = Router();

budgetRouter.use(requireAuth);
budgetRouter.get("/", getBudgets);
budgetRouter.post("/", createBudget);
budgetRouter.put("/:id", updateBudget);
budgetRouter.delete("/:id", deleteBudget);

export default budgetRouter;