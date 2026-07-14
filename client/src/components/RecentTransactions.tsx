import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import api from "../services/api";

type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
};

type RecentTransactionsProps = {
  refreshKey: number;
  onTransactionDeleted: () => void;
};

export default function RecentTransactions({
  refreshKey,
  onTransactionDeleted,
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await api.get("/transactions/recent");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    }

    fetchTransactions();
  }, [refreshKey]);

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      setError("");

      await api.delete(`/transactions/${id}`);

      onTransactionDeleted();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setError("Failed to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-xl font-bold">Recent Transactions</h2>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-4 space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-b-0"
          >
            <span>{transaction.description}</span>

            <div className="flex items-center gap-4">
              <span
                className={
                  transaction.type === "income"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(transaction.id)}
                disabled={deletingId === transaction.id}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === transaction.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <p className="text-slate-400">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}