import "dotenv/config";
import express from "express";
import cors from "cors";

import dashboardRouter from "./routes/dashboard.route.js";
import transactionRouter from "./routes/transaction.route.js";

const app = express();

app.use(cors());
app.use(express.json());

// api health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running!",
  });
});

// Mounts all dashboard-related API routes under /api/dashboard.
app.use("/api/dashboard", dashboardRouter);

// Mounts all transaction-related API routes under /api/transactions.
app.use("/api/transactions", transactionRouter);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});