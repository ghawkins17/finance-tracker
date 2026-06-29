import { useEffect, useState } from "react";
import api from "../services/api";

type Transaction = {
  id: number;
  name: string;
  amount: number;
  type: "income" | "expense";
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const response = await api.get("/transactions/recent");
      setTransactions(response.data);
    }

    fetchTransactions();
  }, []);

  return (
    <div className="rounded-xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-xl font-bold">Recent Transactions</h2>

      <div className="mt-4 space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-b-0"
          >
            <span>{transaction.name}</span>

            <span
              className={
                transaction.type === "income"
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            >
              {transaction.amount >= 0
                ? `+$${transaction.amount.toFixed(2)}`
                : `-$${Math.abs(transaction.amount).toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}