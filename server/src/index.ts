import express from "express";
import cors from "cors";

import dashboardRouter from "./routes/dashboard.route.js";

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

// api recent transactions endpoint
app.get("/api/transactions/recent", (req, res) => {
  res.json([
    { id: 1, name: "Paycheck", amount: 750, type: "income" },
    { id: 2, name: "Walmart", amount: -48.23, type: "expense" },
    { id: 3, name: "Gas", amount: -35.1, type: "expense" },
    { id: 4, name: "Spotify", amount: -11.99, type: "expense" },
  ]);
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});