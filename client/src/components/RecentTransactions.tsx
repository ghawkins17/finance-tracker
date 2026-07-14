import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import api from "../services/api";

type Transaction = {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
};

type EditForm = {
  description: string;
  category: string;
  amount: string;
  type: "income" | "expense";
};

type RecentTransactionsProps = {
  refreshKey: number;
  onTransactionChanged: () => void;
};

export default function RecentTransactions({
  refreshKey,
  onTransactionChanged,
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await api.get("/transactions/recent");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setError("Failed to fetch transactions.");
      }
    }

    fetchTransactions();
  }, [refreshKey]);

  function startEditing(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount.toString(),
      type: transaction.type,
    });
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
    setError("");
  }

  async function handleUpdate(id: number) {
    if (!editForm) {
      return;
    }

    const amount = Number(editForm.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !editForm.description.trim() ||
      !editForm.category.trim()
    ) {
      setError("Enter a valid amount, description, and category.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      await api.put(`/transactions/${id}`, {
        amount,
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        type: editForm.type,
      });

      setEditingId(null);
      setEditForm(null);
      onTransactionChanged();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      setError("Failed to update transaction.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      setError("");

      await api.delete(`/transactions/${id}`);

      onTransactionChanged();
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
        {transactions.map((transaction) => {
          if (editingId === transaction.id && editForm) {
            return (
              <div
                key={transaction.id}
                className="space-y-3 border-b border-slate-700 pb-4"
              >
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Description"
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                />

                <input
                  type="text"
                  value={editForm.category}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      category: event.target.value,
                    })
                  }
                  placeholder="Category"
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                />

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      amount: event.target.value,
                    })
                  }
                  placeholder="Amount"
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                />

                <select
                  value={editForm.type}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      type: event.target.value as "income" | "expense",
                    })
                  }
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(transaction.id)}
                    disabled={updatingId === transaction.id}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {updatingId === transaction.id
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={updatingId === transaction.id}
                    className="rounded bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-b-0"
            >
              <div>
                <p>{transaction.description}</p>
                <p className="text-sm text-slate-400">
                  {transaction.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
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
                  onClick={() => startEditing(transaction)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                >
                  Edit
                </button>

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
          );
        })}

        {transactions.length === 0 && (
          <p className="text-slate-400">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}