import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

type Transaction = {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  transactionDate: string;
};

type TransactionResponse = {
  transactions: Transaction[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  totals: { income: number; expenses: number };
  categories: string[];
};

type EditForm = Omit<Transaction, "id" | "amount"> & { amount: string };

function getApiError(error: unknown, fallback: string) {
  return axios.isAxiosError(error)
    ? error.response?.data?.message ?? fallback
    : fallback;
}

const inputClass =
  "rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none focus:border-blue-500";

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("transactionDate-desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const [sortBy, sortOrder] = sort.split("-");
        const response = await api.get<TransactionResponse>("/transactions", {
          params: {
            page,
            pageSize: 10,
            search: search || undefined,
            category: category || undefined,
            type: type || undefined,
            from: from || undefined,
            to: to || undefined,
            sortBy,
            sortOrder,
          },
        });
        setData(response.data);
      } catch (error) {
        setError(getApiError(error, "Could not load your transactions."));
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, category, type, from, to, sort, page, refreshKey]);

  function resetPage(update: () => void) {
    setPage(1);
    update();
  }

  function startEditing(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      category: transaction.category,
      amount: String(transaction.amount),
      type: transaction.type,
      transactionDate: transaction.transactionDate.slice(0, 10),
    });
    setError("");
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const amount = Number(editForm.amount);
    if (!editForm.description.trim() || !editForm.category.trim() || !editForm.transactionDate || amount <= 0) {
      setError("Enter a valid description, category, amount, and date.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/transactions/${editingId}`, {
        ...editForm,
        amount,
        description: editForm.description.trim(),
        category: editForm.category.trim(),
      });
      setEditingId(null);
      setEditForm(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setError(getApiError(error, "Could not update the transaction."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id: number) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/transactions/${id}`);
      if (data && data.transactions.length === 1 && page > 1) setPage(page - 1);
      else setRefreshKey((key) => key + 1);
    } catch (error) {
      setError(getApiError(error, "Could not delete the transaction."));
    } finally {
      setDeletingId(null);
    }
  }

  const balance = (data?.totals.income ?? 0) - (data?.totals.expenses ?? 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Transactions</h1>
        <p className="mt-2 text-slate-400">Search, filter, and manage your complete transaction history.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Summary label="Filtered income" value={data?.totals.income ?? 0} color="text-emerald-400" />
        <Summary label="Filtered expenses" value={data?.totals.expenses ?? 0} color="text-red-400" />
        <Summary label="Net total" value={balance} color={balance >= 0 ? "text-blue-400" : "text-red-400"} />
      </div>

      <div className="mb-6 rounded-xl bg-slate-800 p-5 shadow-lg">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input aria-label="Search descriptions" placeholder="Search descriptions..." value={search} onChange={(event) => resetPage(() => setSearch(event.target.value))} className={`${inputClass} lg:col-span-2`} />
          <select aria-label="Transaction type" value={type} onChange={(event) => resetPage(() => setType(event.target.value))} className={inputClass}>
            <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select aria-label="Category" value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))} className={inputClass}>
            <option value="">All categories</option>
            {data?.categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="text-sm text-slate-400">From<input type="date" value={from} onChange={(event) => resetPage(() => setFrom(event.target.value))} className={`mt-1 w-full ${inputClass}`} /></label>
          <label className="text-sm text-slate-400">To<input type="date" value={to} onChange={(event) => resetPage(() => setTo(event.target.value))} className={`mt-1 w-full ${inputClass}`} /></label>
          <label className="text-sm text-slate-400">Sort by<select value={sort} onChange={(event) => resetPage(() => setSort(event.target.value))} className={`mt-1 w-full ${inputClass}`}>
            <option value="transactionDate-desc">Newest first</option><option value="transactionDate-asc">Oldest first</option><option value="amount-desc">Highest amount</option><option value="amount-asc">Lowest amount</option>
          </select></label>
          <button type="button" onClick={() => { setSearch(""); setCategory(""); setType(""); setFrom(""); setTo(""); setSort("transactionDate-desc"); setPage(1); }} className="self-end rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600">Clear filters</button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-950/60 p-3 text-red-300">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-slate-800 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-slate-700 bg-slate-900/50 text-sm text-slate-400"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Description</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Type</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody>
              {data?.transactions.map((transaction) => editingId === transaction.id && editForm ? (
                <tr key={transaction.id} className="border-b border-slate-700">
                  <td className="px-3 py-3"><input type="date" value={editForm.transactionDate} onChange={(e) => setEditForm({ ...editForm, transactionDate: e.target.value })} className={`w-36 ${inputClass}`} /></td>
                  <td className="px-3 py-3"><input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`w-full ${inputClass}`} /></td>
                  <td className="px-3 py-3"><input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={`w-full ${inputClass}`} /></td>
                  <td className="px-3 py-3"><select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as "income" | "expense" })} className={inputClass}><option value="income">Income</option><option value="expense">Expense</option></select></td>
                  <td className="px-3 py-3"><input type="number" min="0.01" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className={`w-28 ${inputClass}`} /></td>
                  <td className="px-3 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={saveEdit} disabled={saving} className="rounded bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button><button onClick={() => { setEditingId(null); setEditForm(null); }} className="rounded bg-slate-600 px-3 py-2 text-sm hover:bg-slate-500">Cancel</button></div></td>
                </tr>
              ) : (
                <tr key={transaction.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-700/30">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-300">{transaction.transactionDate.slice(0, 10)}</td><td className="px-5 py-4 font-medium">{transaction.description}</td><td className="px-5 py-4 text-slate-300">{transaction.category}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${transaction.type === "income" ? "bg-emerald-950 text-emerald-300" : "bg-red-950 text-red-300"}`}>{transaction.type}</span></td><td className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}>{transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => startEditing(transaction)} className="rounded bg-blue-600 px-3 py-1.5 text-sm hover:bg-blue-500">Edit</button><button onClick={() => deleteTransaction(transaction.id)} disabled={deletingId === transaction.id} className="rounded bg-red-600 px-3 py-1.5 text-sm hover:bg-red-500 disabled:opacity-50">{deletingId === transaction.id ? "Deleting..." : "Delete"}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="p-8 text-center text-slate-400">Loading transactions...</p>}
        {!loading && data?.transactions.length === 0 && <p className="p-8 text-center text-slate-400">No transactions match these filters.</p>}
        {data && <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-700 px-5 py-4 sm:flex-row"><p className="text-sm text-slate-400">{data.pagination.total} transaction{data.pagination.total === 1 ? "" : "s"} Ã‚Â· Page {data.pagination.page} of {data.pagination.totalPages}</p><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>}
      </div>
    </section>
  );
}

function Summary({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-xl bg-slate-800 p-5 shadow-lg"><p className="text-sm text-slate-400">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{formatCurrency(value)}</p></div>;
}