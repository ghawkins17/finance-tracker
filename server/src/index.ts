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

const PORT = Number(process.env.PORT) || 3000;

app.get("/", (_req, res) => {
    res.json({ message: "Server root works" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is actually listening on port ${PORT}`);
    console.log(`Test: http://127.0.0.1:${PORT}/`);
});

server.on("error", (error) => {
    console.error("Server failed to start:", error);
});